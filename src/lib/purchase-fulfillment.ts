import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendPurchaseConfirmation } from "@/lib/email";
import { generateDownloadToken } from "@/lib/tokens";
import type { MoneyMinor } from "@/lib/money";
import type { FulfillmentEvent } from "@/lib/payment/types";
import { Decimal } from "@/lib/money";

export type FulfillPurchaseInput = {
  provider?: string;
  productId: string;
  buyerName: string;
  buyerEmail: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  lemonSqueezyOrderId?: string;
  amountMinor?: MoneyMinor;
  currency?: string;
  buyerIp?: string;
  userAgent?: string;
  siteUrl?: string;
  couponCode?: string;
  incrementCoupon?: boolean;
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
    couponCode: event.couponCode,
    incrementCoupon: true,
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
    couponCode,
    incrementCoupon = true,
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
          couponCode: couponCode ?? null,
        },
        include: { product: true },
      });

      // Update coupon use count if set
      if (couponCode && incrementCoupon) {
        try {
          await prisma.coupon.update({
            where: { code: couponCode },
            data: { useCount: { increment: 1 } },
          });
        } catch (couponErr) {
          console.error("Failed to increment coupon useCount:", couponErr);
        }
      }
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
  const productIds = event.productId.split(",");

  if (productIds.length > 1) {
    const results = [];
    const splitAmountMinor = event.amountMinor 
      ? new Decimal(Math.round(event.amountMinor.toNumber() / productIds.length))
      : undefined;

    for (let i = 0; i < productIds.length; i++) {
      const pId = productIds[i];
      const itemInput: FulfillPurchaseInput = {
        provider: event.provider,
        productId: pId,
        buyerName: event.buyerName,
        buyerEmail: event.buyerEmail,
        // Suffix session IDs to prevent database unique index collisions
        stripeSessionId: event.stripeSessionId ? `${event.stripeSessionId}_${pId}` : undefined,
        stripePaymentIntentId: event.stripePaymentIntentId ? `${event.stripePaymentIntentId}_${pId}` : undefined,
        stripeChargeId: event.stripeChargeId ? `${event.stripeChargeId}_${pId}` : undefined,
        lemonSqueezyOrderId: event.lemonSqueezyOrderId ? `${event.lemonSqueezyOrderId}_${pId}` : undefined,
        amountMinor: splitAmountMinor,
        currency: event.currency,
        buyerIp: event.buyerIp,
        userAgent: event.userAgent,
        siteUrl: event.siteUrl,
        couponCode: event.couponCode,
        incrementCoupon: i === 0, // only increment coupon use count once
      };

      const result = await fulfillProductPurchase(itemInput);
      results.push(result);
    }
    return results[0];
  }

  return fulfillProductPurchase(fulfillmentEventToInput(event));
}
