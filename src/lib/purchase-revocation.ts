import { prisma } from "@/lib/prisma";

type RevokeLocator = {
  stripePaymentIntentId?: string | null;
  stripeChargeId?: string | null;
  stripeSessionId?: string | null;
};

async function findPurchaseByStripeRefs(locator: RevokeLocator) {
  const { stripePaymentIntentId, stripeChargeId, stripeSessionId } = locator;

  if (stripePaymentIntentId) {
    const p = await prisma.purchase.findUnique({
      where: { stripePaymentIntentId },
    });
    if (p) return p;
  }
  if (stripeSessionId) {
    const p = await prisma.purchase.findUnique({
      where: { stripeSessionId },
    });
    if (p) return p;
  }
  if (stripeChargeId) {
    const p = await prisma.purchase.findFirst({
      where: { stripeChargeId },
    });
    if (p) return p;
  }
  return null;
}

/**
 * Revoke download access for a purchase (refund or dispute). Idempotent:
 * revokedAt is set once. Returns false if no matching purchase is found yet
 * (e.g. refund webhook arrived before fulfillment) so the caller can decide to
 * 500 and let Stripe retry.
 */
export async function revokePurchaseAccess(
  locator: RevokeLocator,
  reason: { revoke?: boolean; disputeStatus?: string; chargeId?: string },
): Promise<boolean> {
  const purchase = await findPurchaseByStripeRefs(locator);
  if (!purchase) return false;

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: {
      ...(reason.revoke ? { revokedAt: purchase.revokedAt ?? new Date() } : {}),
      ...(reason.disputeStatus ? { disputeStatus: reason.disputeStatus } : {}),
      ...(reason.chargeId && !purchase.stripeChargeId
        ? { stripeChargeId: reason.chargeId }
        : {}),
    },
  });

  return true;
}

export async function setDisputeStatus(
  locator: RevokeLocator,
  disputeStatus: string,
  options: { revoke: boolean; chargeId?: string },
): Promise<boolean> {
  return revokePurchaseAccess(locator, {
    revoke: options.revoke,
    disputeStatus,
    chargeId: options.chargeId,
  });
}
