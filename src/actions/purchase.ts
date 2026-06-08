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

  const validatedFields = PurchaseSchema.safeParse({
    productId: formData.get("productId"),
    buyerName: formData.get("buyerName"),
    buyerEmail: formData.get("buyerEmail"),
  });
  if (!validatedFields.success) {
    return { error: "Please check your details and try again." };
  }

  const { productId, buyerName, buyerEmail } = validatedFields.data;

  const emailLimiter = getPurchaseEmailLimiter();
  if (emailLimiter) {
    const { success } = await emailLimiter.limit(buyerEmail.toLowerCase());
    if (!success) {
      return {
        error: "Too many purchase attempts for this email. Try again later.",
      };
    }
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isVisible) {
    return { error: "Product not found or unavailable." };
  }

  if (providerId === "lemonsqueezy" && !product.lemonSqueezyVariantId) {
    return {
      error:
        "This product is not available for purchase with the current payment provider.",
    };
  }

  const { amountMinor, currency } = resolveProductAmount(product);
  if (amountMinor <= 0) {
    return { error: "This product is not available for purchase." };
  }

  if (
    providerId === "stripe" &&
    !isAboveStripeMinimum(amountMinor, currency)
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

  return {
    context: {
      productId: product.id,
      lemonSqueezyVariantId: product.lemonSqueezyVariantId,
      buyerName,
      buyerEmail,
      amountMinor,
      currency,
      productName: product.name,
      productDescription: product.description,
      baseUrl: getRequestBaseUrl(headerList),
      ip,
      userAgent: headerList.get("user-agent")?.slice(0, 500) ?? undefined,
      checkoutMode: checkoutModeForProvider,
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
    const validatedFields = PurchaseSchema.safeParse({
      productId: formData.get("productId"),
      buyerName: formData.get("buyerName"),
      buyerEmail: formData.get("buyerEmail"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        errors: validatedFields.error.flatten().fieldErrors,
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
