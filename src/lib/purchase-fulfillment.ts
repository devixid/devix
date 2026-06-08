import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendPurchaseConfirmation } from "@/lib/email";
import { generateDownloadToken } from "@/lib/tokens";
import type { FulfillmentEvent } from "@/lib/payment/types";

export type FulfillPurchaseInput = {
  provider?: string;
  productId: string;
  buyerName: string;
  buyerEmail: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  lemonSqueezyOrderId?: string;
  amountMinor?: number;
  currency?: string;
  buyerIp?: string;
  userAgent?: string;
  siteUrl?: string;
};

function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002"
  );
}

async function findExistingPurchase(input: FulfillPurchaseInput) {
  if (input.stripeSessionId) {
    const bySession = await prisma.purchase.findUnique({
      where: { stripeSessionId: input.stripeSessionId },
      include: { product: true },
    });
    if (bySession) return bySession;
  }
  if (input.stripePaymentIntentId) {
    const byPi = await prisma.purchase.findUnique({
      where: { stripePaymentIntentId: input.stripePaymentIntentId },
      include: { product: true },
    });
    if (byPi) return byPi;
  }
  if (input.lemonSqueezyOrderId) {
    const byOrder = await prisma.purchase.findUnique({
      where: { lemonSqueezyOrderId: input.lemonSqueezyOrderId },
      include: { product: true },
    });
    if (byOrder) return byOrder;
  }
  return null;
}

type PurchaseWithProduct = Prisma.PurchaseGetPayload<{
  include: { product: true };
}>;

export function fulfillmentEventToInput(
  event: FulfillmentEvent,
): FulfillPurchaseInput {
  return {
    provider: event.provider,
    productId: event.productId,
    buyerName: event.buyerName,
    buyerEmail: event.buyerEmail,
    stripeSessionId: event.stripeSessionId,
    stripePaymentIntentId: event.stripePaymentIntentId,
    stripeChargeId: event.stripeChargeId,
    lemonSqueezyOrderId: event.lemonSqueezyOrderId,
    amountMinor: event.amountMinor,
    currency: event.currency,
    buyerIp: event.buyerIp,
    userAgent: event.userAgent,
    siteUrl: event.siteUrl,
  };
}

/**
 * Idempotent fulfillment shared by Stripe and Lemon Squeezy webhooks.
 * Safe to call repeatedly for the same payment: it dedups on provider refs
 * and only sends the confirmation email once (emailSentAt).
 *
 * Throws if the email cannot be sent so the webhook returns 500 and the
 * provider retries until both the row and the email succeed.
 */
export async function fulfillProductPurchase(input: FulfillPurchaseInput) {
  const {
    provider = "stripe",
    productId,
    buyerName,
    buyerEmail,
    stripeSessionId,
    stripePaymentIntentId,
    stripeChargeId,
    lemonSqueezyOrderId,
    amountMinor,
    currency,
    buyerIp,
    userAgent,
    siteUrl,
  } = input;

  let purchase: PurchaseWithProduct | null = await findExistingPurchase(input);

  if (!purchase) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isVisible) {
      throw new Error("Product not found or unavailable.");
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    try {
      purchase = await prisma.purchase.create({
        data: {
          provider,
          productId,
          buyerName,
          buyerEmail,
          downloadToken: generateDownloadToken(),
          tokenExpiresAt: expiresAt,
          deliveredFileKey: product.fileKey,
          stripeSessionId,
          stripePaymentIntentId,
          stripeChargeId,
          lemonSqueezyOrderId,
          amountMinor: amountMinor ?? null,
          currency: (currency ?? product.currency ?? "usd").toLowerCase(),
          buyerIp,
          userAgent,
        },
        include: { product: true },
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        purchase = await findExistingPurchase(input);
      } else {
        throw err;
      }
    }
  }

  if (!purchase) {
    throw new Error("Failed to resolve purchase after concurrent create.");
  }

  if (!purchase.emailSentAt) {
    const emailBaseUrl =
      siteUrl?.replace(/\/$/, "") ||
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      "";

    await sendPurchaseConfirmation({
      name: purchase.buyerName,
      email: purchase.buyerEmail,
      productName: purchase.product.name,
      downloadToken: purchase.downloadToken,
      siteUrl: emailBaseUrl,
    });

    purchase = await prisma.purchase.update({
      where: { id: purchase.id },
      data: { emailSentAt: new Date() },
      include: { product: true },
    });
  }

  return purchase;
}

export async function fulfillFromPaymentEvent(event: FulfillmentEvent) {
  return fulfillProductPurchase(fulfillmentEventToInput(event));
}
