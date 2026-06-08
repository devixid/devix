import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { sendPurchaseConfirmation } from "@/lib/email";
import { fulfillProductPurchase } from "@/lib/purchase-fulfillment";
import { rotatePurchaseDownloadToken } from "@/lib/rotate-purchase-download-token";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export type PurchaseEmailResendResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

function asId(
  value: string | Stripe.PaymentIntent | null | undefined,
): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.id;
}

export function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "your email";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const maskedLocal =
    local.length <= 2
      ? `${local[0] ?? ""}*`
      : `${local[0]}${"*".repeat(Math.min(local.length - 2, 3))}${local.at(-1)}`;
  return `${maskedLocal}@${domain}`;
}

/**
 * Verifies a paid Checkout Session, ensures the purchase row exists (fulfills
 * if the webhook is delayed), then sends the download-link email again.
 */
export async function resendPurchaseEmailByStripeSession(
  sessionId: string,
  siteUrl: string,
): Promise<PurchaseEmailResendResult> {
  if (!sessionId.startsWith("cs_")) {
    return { ok: false, error: "Invalid checkout reference." };
  }

  if (!isStripeConfigured()) {
    return { ok: false, error: "Payments are not configured." };
  }

  const stripe = getStripe();
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return {
      ok: false,
      error:
        "Could not verify your payment. Contact support if this continues.",
    };
  }

  if (session.payment_status !== "paid") {
    return {
      ok: false,
      error:
        "Payment is not completed yet. Wait a moment, refresh, and try again.",
    };
  }

  const productId = session.metadata?.productId;
  const buyerName = session.metadata?.buyerName;
  const buyerEmail =
    session.metadata?.buyerEmail ||
    session.customer_details?.email ||
    session.customer_email ||
    undefined;

  if (!productId || !buyerName || !buyerEmail) {
    return {
      ok: false,
      error: "Could not resolve your order. Please contact support.",
    };
  }

  const emailBaseUrl = (
    session.metadata?.siteUrl ||
    siteUrl ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    ""
  ).replace(/\/$/, "");

  let purchase = await prisma.purchase.findUnique({
    where: { stripeSessionId: sessionId },
    include: { product: true },
  });

  if (!purchase) {
    try {
      purchase = await fulfillProductPurchase({
        productId,
        buyerName,
        buyerEmail,
        stripeSessionId: session.id,
        stripePaymentIntentId: asId(session.payment_intent),
        amountMinor: session.amount_total ?? undefined,
        currency: session.currency ?? undefined,
        buyerIp: session.metadata?.buyerIp,
        userAgent: session.metadata?.userAgent,
        siteUrl: emailBaseUrl,
      });
      return {
        ok: true,
        message: `Download link sent to ${maskEmail(purchase.buyerEmail)}.`,
      };
    } catch (err) {
      console.error("[Purchase email resend] Fulfillment failed:", err);
      return {
        ok: false,
        error: "Could not send the email right now. Please try again shortly.",
      };
    }
  }

  if (purchase.revokedAt) {
    return {
      ok: false,
      error: "This purchase is no longer active. Contact support for help.",
    };
  }

  let purchaseForEmail;
  try {
    // New token invalidates any previous link; grace window resets for 24h.
    purchaseForEmail = await rotatePurchaseDownloadToken(purchase.id);
  } catch (err) {
    console.error("[Purchase email resend] Token rotation failed:", err);
    return {
      ok: false,
      error: "Could not issue a new download link. Please try again shortly.",
    };
  }

  try {
    await sendPurchaseConfirmation({
      name: purchaseForEmail.buyerName,
      email: purchaseForEmail.buyerEmail,
      productName: purchaseForEmail.product.name,
      downloadToken: purchaseForEmail.downloadToken,
      siteUrl: emailBaseUrl,
    });
  } catch (err) {
    console.error("[Purchase email resend] Send failed:", err);
    return {
      ok: false,
      error: "Could not send the email. Please try again in a few minutes.",
    };
  }

  await prisma.purchase.update({
    where: { id: purchaseForEmail.id },
    data: { emailSentAt: new Date() },
  });

  return {
    ok: true,
    message: `New download link sent to ${maskEmail(purchaseForEmail.buyerEmail)}. Previous links no longer work.`,
  };
}
