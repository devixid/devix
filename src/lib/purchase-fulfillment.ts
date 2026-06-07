import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendPurchaseConfirmation } from "@/lib/email";
import { generateDownloadToken } from "@/lib/tokens";

export type FulfillPurchaseInput = {
  productId: string;
  buyerName: string;
  buyerEmail: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
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
  return null;
}

type PurchaseWithProduct = Prisma.PurchaseGetPayload<{
  include: { product: true };
}>;

/**
 * Idempotent fulfillment shared by Checkout Sessions and (future) PaymentIntents.
 * Safe to call repeatedly for the same payment: it dedups on stripeSessionId /
 * stripePaymentIntentId and only sends the confirmation email once (emailSentAt).
 *
 * Throws if the email cannot be sent so the webhook returns 500 and Stripe
 * retries until both the row and the email succeed.
 */
export async function fulfillProductPurchase(input: FulfillPurchaseInput) {
  const {
    productId,
    buyerName,
    buyerEmail,
    stripeSessionId,
    stripePaymentIntentId,
    stripeChargeId,
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
          productId,
          buyerName,
          buyerEmail,
          downloadToken: generateDownloadToken(),
          tokenExpiresAt: expiresAt,
          stripeSessionId,
          stripePaymentIntentId,
          stripeChargeId,
          amountMinor: amountMinor ?? null,
          currency: (currency ?? product.currency ?? "usd").toLowerCase(),
          buyerIp,
          userAgent,
        },
        include: { product: true },
      });
    } catch (err) {
      // Concurrent delivery created the row first — re-fetch and continue.
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

  // Email gate: send exactly once, retry-safe.
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
