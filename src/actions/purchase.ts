"use server";

import { createHash } from "crypto";
import type Stripe from "stripe";
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
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { verifyTurnstile } from "@/lib/turnstile";
import {
  resolveProductAmount,
  isAboveStripeMinimum,
  toStripeAmount,
} from "@/lib/money";

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

type CheckoutContext = {
  productId: string;
  buyerName: string;
  buyerEmail: string;
  amountMinor: number;
  currency: string;
  productName: string;
  productDescription: string;
  baseUrl: string;
  ip: string;
  userAgent?: string;
};

/**
 * Shared guard rails for both the redirect (Checkout Session) and embedded
 * flows: bot check, rate limits, validation, product + currency resolution.
 * Returns either an error message or a resolved checkout context.
 */
async function resolveCheckoutContext(
  formData: FormData,
): Promise<{ error: string } | { context: CheckoutContext }> {
  if (!isStripeConfigured()) {
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

  const { amountMinor, currency } = resolveProductAmount(product);
  if (amountMinor <= 0) {
    return { error: "This product is not available for purchase." };
  }
  if (!isAboveStripeMinimum(amountMinor, currency)) {
    return {
      error: "This product's price is below the minimum chargeable amount.",
    };
  }

  return {
    context: {
      productId: product.id,
      buyerName,
      buyerEmail,
      amountMinor,
      currency,
      productName: product.name,
      productDescription: product.description,
      baseUrl: getRequestBaseUrl(headerList),
      ip,
      userAgent: headerList.get("user-agent")?.slice(0, 500) ?? undefined,
    },
  };
}

function buildCheckoutMetadata(ctx: CheckoutContext) {
  return {
    productId: ctx.productId,
    buyerName: ctx.buyerName,
    buyerEmail: ctx.buyerEmail,
    siteUrl: ctx.baseUrl,
    buyerIp: ctx.ip,
    userAgent: ctx.userAgent ?? "",
  };
}

function buildLineItems(ctx: CheckoutContext) {
  return [
    {
      quantity: 1,
      price_data: {
        currency: ctx.currency,
        unit_amount: toStripeAmount(ctx.amountMinor),
        product_data: {
          name: ctx.productName,
          description: ctx.productDescription.slice(0, 500) || undefined,
        },
      },
    },
  ];
}

function checkoutIdempotencyKey(ctx: CheckoutContext, mode: string): string {
  return createHash("sha256")
    .update(
      `${mode}:${ctx.productId}:${ctx.buyerEmail.toLowerCase()}:${Math.floor(Date.now() / 60000)}`,
    )
    .digest("hex");
}

/**
 * Embedded Checkout (ui_mode: "embedded"). Returns a client_secret the browser
 * renders with EmbeddedCheckoutProvider. Fulfillment still happens ONLY in the
 * webhook via checkout.session.completed — the client never fulfills.
 */
export async function createEmbeddedCheckoutSession(
  formData: FormData,
): Promise<EmbeddedCheckoutState> {
  try {
    const resolved = await resolveCheckoutContext(formData);
    if ("error" in resolved) return { ok: false, error: resolved.error };
    const ctx = resolved.context;

    const stripe = getStripe();
    const metadata = buildCheckoutMetadata(ctx);

    // `ui_mode: "embedded"` is API-correct for Embedded Checkout. The pinned
    // stripe-node types use a renamed UiMode union, so cast this one field.
    const params = {
      ui_mode: "embedded",
      mode: "payment",
      customer_email: ctx.buyerEmail,
      line_items: buildLineItems(ctx),
      metadata,
      payment_intent_data: { metadata },
      return_url: `${ctx.baseUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
    } as unknown as Stripe.Checkout.SessionCreateParams;

    const session = await stripe.checkout.sessions.create(params, {
      idempotencyKey: checkoutIdempotencyKey(ctx, "embedded"),
    });

    if (!session.client_secret) {
      return {
        ok: false,
        error: "Could not start checkout. Please try again.",
      };
    }

    return { ok: true, clientSecret: session.client_secret };
  } catch (error) {
    console.error("Embedded checkout error:", error);
    return {
      ok: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function submitPurchase(
  prevState: PurchaseState,
  formData: FormData,
): Promise<PurchaseState> {
  try {
    if (!isStripeConfigured()) {
      return {
        success: false,
        message:
          "Payments are not configured yet. Please contact support or try again later.",
      };
    }

    const headerList = await headers();
    const ip = getClientIp(headerList);

    // Bot protection (no-op if Turnstile not configured).
    const turnstileToken = formData.get("turnstileToken");
    const humanVerified = await verifyTurnstile(
      typeof turnstileToken === "string" ? turnstileToken : null,
      ip,
    );
    if (!humanVerified) {
      return {
        success: false,
        message: "Verification failed. Please refresh and try again.",
      };
    }

    // Per-IP velocity.
    const limiter = getPurchaseLimiter();
    if (limiter) {
      const { success } = await limiter.limit(ip);
      if (!success) {
        return {
          success: false,
          message: "Too many purchase attempts. Please try again later.",
        };
      }
    }

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

    const { productId, buyerName, buyerEmail } = validatedFields.data;

    // Per-email velocity (catches rotating IPs / card testing).
    const emailLimiter = getPurchaseEmailLimiter();
    if (emailLimiter) {
      const { success } = await emailLimiter.limit(buyerEmail.toLowerCase());
      if (!success) {
        return {
          success: false,
          message:
            "Too many purchase attempts for this email. Try again later.",
        };
      }
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isVisible) {
      return {
        success: false,
        message: "Product not found or unavailable.",
      };
    }

    const { amountMinor, currency } = resolveProductAmount(product);

    if (amountMinor <= 0) {
      return {
        success: false,
        message: "This product is not available for purchase.",
      };
    }

    if (!isAboveStripeMinimum(amountMinor, currency)) {
      return {
        success: false,
        message: "This product's price is below the minimum chargeable amount.",
      };
    }

    const baseUrl = getRequestBaseUrl(headerList);
    const userAgent = headerList.get("user-agent") ?? undefined;
    const stripe = getStripe();

    // Idempotency key: dedups accidental double-submits / network retries
    // within a short window so we don't create duplicate sessions.
    const idempotencyKey = createHash("sha256")
      .update(
        `${productId}:${buyerEmail.toLowerCase()}:${Math.floor(Date.now() / 60000)}`,
      )
      .digest("hex");

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: buyerEmail,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency,
              unit_amount: toStripeAmount(amountMinor),
              product_data: {
                name: product.name,
                description: product.description.slice(0, 500) || undefined,
              },
            },
          },
        ],
        metadata: {
          productId: product.id,
          buyerName,
          buyerEmail,
          siteUrl: baseUrl,
          buyerIp: ip,
          userAgent: userAgent?.slice(0, 500) ?? "",
        },
        // Propagate buyer metadata onto the PaymentIntent too, so the
        // payment_intent.* webhook path can fulfill/evidence independently.
        payment_intent_data: {
          metadata: {
            productId: product.id,
            buyerName,
            buyerEmail,
            siteUrl: baseUrl,
            buyerIp: ip,
            userAgent: userAgent?.slice(0, 500) ?? "",
          },
        },
        success_url: `${baseUrl}/store/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/store/cancel`,
      },
      { idempotencyKey },
    );

    if (!session.url) {
      return {
        success: false,
        message: "Could not start checkout. Please try again.",
      };
    }

    return {
      success: true,
      checkoutUrl: session.url,
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
