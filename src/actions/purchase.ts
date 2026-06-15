"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { PurchaseSchema } from "@/lib/schemas";
import {
  getPurchaseLimiter,
  getPurchaseEmailLimiter,
  getClientIp,
} from "@/lib/rate-limit";
import { getRequestBaseUrl } from "@/lib/request-url";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  resolveProductAmount,
  isAboveStripeMinimum,
  Decimal,
} from "@/lib/money";
import {
  getPaymentProvider,
  resolvePaymentProviderId,
  isPaymentProviderConfigured,
} from "@/lib/payment";
import type {
  CreateCheckoutParams,
  CreateCheckoutResult,
  ProviderCheckoutState,
} from "@/lib/payment/types";

export type PurchaseState = {
  success: boolean;
  message?: string;
  checkoutUrl?: string;
  errors?: z.core.$ZodFlattenedError<
    z.output<typeof PurchaseSchema>
  >["fieldErrors"];
};

export type EmbeddedCheckoutState =
  | { ok: true; clientSecret: string }
  | { ok: false; error: string };

export type OverlayCheckoutState =
  | { ok: true; url: string }
  | { ok: false; error: string };



const CheckoutSchema = z.object({
  productIds: z.array(z.string().cuid("Invalid product ID.")).min(1, "At least one product is required"),
  buyerName: z.string().min(2, "Name must be at least 2 characters.").max(100),
  buyerEmail: z.string().email("Please enter a valid email address.").max(255),
});

type CheckoutContext = CreateCheckoutParams;

async function resolveCheckoutContext(
  formData: FormData,
  checkoutMode: "embedded" | "redirect" | "overlay" = "embedded",
): Promise<{ error: string } | { context: CheckoutContext }> {
  const providerId = await resolvePaymentProviderId();

  if (!isPaymentProviderConfigured(providerId)) {
    return {
      error:
        "Payments are not configured yet. Please contact support or try again later.",
    };
  }

  const headerList = await headers();
  const ip = getClientIp(headerList);

  const turnstileToken = formData.get("turnstileToken");
  const humanVerified = await verifyTurnstile(
    typeof turnstileToken === "string" ? turnstileToken : null,
    ip,
  );
  if (!humanVerified) {
    return { error: "Verification failed. Please refresh and try again." };
  }

  const limiter = getPurchaseLimiter();
  if (limiter) {
    const { success } = await limiter.limit(ip);
    if (!success) {
      return { error: "Too many purchase attempts. Please try again later." };
    }
  }

  const rawProductIds = formData.getAll("productIds");
  const productIds = rawProductIds.length > 0
    ? rawProductIds.map(String)
    : [String(formData.get("productId") || "")].filter(Boolean);

  const validatedFields = CheckoutSchema.safeParse({
    productIds,
    buyerName: formData.get("buyerName"),
    buyerEmail: formData.get("buyerEmail"),
  });
  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message };
  }

  const { productIds: validatedProductIds, buyerName, buyerEmail } = validatedFields.data;

  const emailLimiter = getPurchaseEmailLimiter();
  if (emailLimiter) {
    const { success } = await emailLimiter.limit(buyerEmail.toLowerCase());
    if (!success) {
      return {
        error: "Too many purchase attempts for this email. Try again later.",
      };
    }
  }

  const products = await prisma.product.findMany({
    where: {
      id: { in: validatedProductIds },
      isVisible: true,
    },
  });

  if (products.length !== validatedProductIds.length) {
    return { error: "One or more selected products are unavailable." };
  }

  if (providerId === "lemonsqueezy" && validatedProductIds.length > 1) {
    return {
      error: "Lemon Squeezy only supports purchasing one item at a time.",
    };
  }

  if (providerId === "lemonsqueezy" && !products[0].lemonSqueezyVariantId) {
    return {
      error:
        "This product is not available for purchase with the current payment provider.",
    };
  }

  let totalOriginalMinor = 0;
  const currency = (products[0].currency || "usd").toLowerCase();

  for (const prod of products) {
    const { amountMinor } = resolveProductAmount(prod);
    totalOriginalMinor += amountMinor.toNumber();
  }

  if (totalOriginalMinor <= 0) {
    return { error: "This product is not available for purchase." };
  }

  // Calculate bundling discount rate: 2 items = 10%, >=3 items = 15%
  let bundleDiscountRate = 0;
  if (validatedProductIds.length === 2) {
    bundleDiscountRate = 0.10;
  } else if (validatedProductIds.length >= 3) {
    bundleDiscountRate = 0.15;
  }

  const amountAfterBundling = totalOriginalMinor * (1 - bundleDiscountRate);

  const couponCodeRaw = formData.get("couponCode");
  const couponCode =
    typeof couponCodeRaw === "string" && couponCodeRaw.trim()
      ? couponCodeRaw.trim().toUpperCase()
      : undefined;

  let finalAmountMinor = amountAfterBundling;

  if (couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCode },
    });

    if (!coupon || !coupon.active) {
      return { error: "Invalid or inactive coupon code." };
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { error: "This coupon code has expired." };
    }

    if (coupon.maxUses != null && coupon.useCount >= coupon.maxUses) {
      return { error: "This coupon code has reached its maximum usage limit." };
    }

    // Apply coupon
    if (coupon.discountType === "PERCENTAGE") {
      finalAmountMinor = amountAfterBundling * (1 - Number(coupon.discountValue) / 100);
    } else if (coupon.discountType === "FIXED") {
      const discountMinor = Number(coupon.discountValue) * 100;
      finalAmountMinor = Math.max(0, amountAfterBundling - discountMinor);
    }
  }

  const roundedAmountMinor = new Decimal(Math.round(finalAmountMinor));

  if (
    providerId === "stripe" &&
    !isAboveStripeMinimum(roundedAmountMinor, currency)
  ) {
    return {
      error: "This product's price is below the minimum chargeable amount.",
    };
  }

  const checkoutModeForProvider: CreateCheckoutParams["checkoutMode"] =
    providerId === "lemonsqueezy"
      ? checkoutMode === "redirect"
        ? "redirect"
        : "embedded"
      : checkoutMode === "overlay"
        ? "embedded"
        : checkoutMode;

  const productName = products.map((p) => p.name).join(", ");
  const productDescription =
    products.length > 1
      ? `Bundle purchase of: ${products.map((p) => p.name).join(", ")}`
      : products[0].description;

  return {
    context: {
      productId: validatedProductIds.join(","),
      lemonSqueezyVariantId: products[0]?.lemonSqueezyVariantId,
      buyerName,
      buyerEmail,
      amountMinor: roundedAmountMinor,
      currency,
      productName,
      productDescription,
      baseUrl: getRequestBaseUrl(headerList),
      ip,
      userAgent: headerList.get("user-agent")?.slice(0, 500) ?? undefined,
      checkoutMode: checkoutModeForProvider,
      couponCode,
    },
  };
}

/**
 * Provider-agnostic checkout entry point. Fulfillment happens only in webhooks.
 */
export async function createProviderCheckout(
  formData: FormData,
  options?: { checkoutMode?: "embedded" | "redirect" | "overlay" },
): Promise<ProviderCheckoutState> {
  try {
    const resolved = await resolveCheckoutContext(
      formData,
      options?.checkoutMode ?? "embedded",
    );
    if ("error" in resolved) {
      return { ok: false, error: resolved.error };
    }

    const provider = await getPaymentProvider();
    const result = await provider.createCheckout(resolved.context);
    return { ok: true, result };
  } catch (error) {
    console.error("Provider checkout error:", error);
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function createEmbeddedCheckoutSession(
  formData: FormData,
): Promise<EmbeddedCheckoutState> {
  const checkout = await createProviderCheckout(formData, {
    checkoutMode: "embedded",
  });

  if (!checkout.ok) {
    return { ok: false, error: checkout.error };
  }

  if (checkout.result.mode === "embedded") {
    return { ok: true, clientSecret: checkout.result.clientSecret };
  }

  return {
    ok: false,
    error: "Embedded checkout is not available for the active payment provider.",
  };
}

export async function createOverlayCheckoutSession(
  formData: FormData,
): Promise<OverlayCheckoutState> {
  const checkout = await createProviderCheckout(formData, {
    checkoutMode: "overlay",
  });

  if (!checkout.ok) {
    return { ok: false, error: checkout.error };
  }

  if (checkout.result.mode === "overlay") {
    return { ok: true, url: checkout.result.url };
  }

  return {
    ok: false,
    error: "Overlay checkout is not available for the active payment provider.",
  };
}

export async function submitPurchase(
  prevState: PurchaseState,
  formData: FormData,
): Promise<PurchaseState> {
  try {
    const rawProductIds = formData.getAll("productIds");
    const productIds = rawProductIds.length > 0
      ? rawProductIds.map(String)
      : [String(formData.get("productId") || "")].filter(Boolean);

    const validatedFields = CheckoutSchema.safeParse({
      productIds,
      buyerName: formData.get("buyerName"),
      buyerEmail: formData.get("buyerEmail"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        errors: {
          productId: [validatedFields.error.issues[0].message],
        } as PurchaseState["errors"],
      };
    }

    const checkout = await createProviderCheckout(formData, {
      checkoutMode: "redirect",
    });

    if (!checkout.ok) {
      return { success: false, message: checkout.error };
    }

    const result: CreateCheckoutResult = checkout.result;

    if (result.mode !== "redirect") {
      return {
        success: false,
        message:
          "Redirect checkout is not available for the active payment provider.",
      };
    }

    return {
      success: true,
      checkoutUrl: result.url,
      message: "Redirecting to secure checkout...",
    };
  } catch (error) {
    console.error("Purchase checkout error:", error);
    return {
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function getVisibleProducts() {
  return prisma.product.findMany({
    where: { isVisible: true },
    orderBy: { order: "asc" },
  });
}

export async function validateCouponAction(
  code: string,
): Promise<{
  success: boolean;
  discountType?: string;
  discountValue?: number;
  message?: string;
}> {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.active) {
      return { success: false, message: "Invalid or inactive coupon code." };
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { success: false, message: "This coupon code has expired." };
    }

    if (coupon.maxUses != null && coupon.useCount >= coupon.maxUses) {
      return {
        success: false,
        message: "This coupon code has reached its maximum usage limit.",
      };
    }

    return {
      success: true,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
    };
  } catch (error) {
    console.error("Coupon validation error:", error);
    return {
      success: false,
      message: "An error occurred during coupon validation.",
    };
  }
}

export async function getActivePaymentProvider(): Promise<string> {
  const providerId = await resolvePaymentProviderId();
  return providerId;
}




