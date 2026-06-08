import { prisma } from "@/lib/prisma";
import type { RevocationEvent } from "@/lib/payment/types";

type RevokeLocator = {
  stripePaymentIntentId?: string | null;
  stripeChargeId?: string | null;
  stripeSessionId?: string | null;
  lemonSqueezyOrderId?: string | null;
};

async function findPurchaseByPaymentRefs(locator: RevokeLocator) {
  const {
    stripePaymentIntentId,
    stripeChargeId,
    stripeSessionId,
    lemonSqueezyOrderId,
  } = locator;

  if (lemonSqueezyOrderId) {
    const p = await prisma.purchase.findUnique({
      where: { lemonSqueezyOrderId },
    });
    if (p) return p;
  }
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

export function revocationEventToLocator(
  event: RevocationEvent,
): RevokeLocator {
  return {
    stripePaymentIntentId: event.stripePaymentIntentId,
    stripeChargeId: event.stripeChargeId,
    stripeSessionId: event.stripeSessionId,
    lemonSqueezyOrderId: event.lemonSqueezyOrderId,
  };
}

/**
 * Revoke download access for a purchase (refund or dispute). Idempotent:
 * revokedAt is set once. Returns false if no matching purchase is found yet
 * so the caller can 500 and let the provider retry.
 */
export async function revokePurchaseAccess(
  locator: RevokeLocator,
  reason: { revoke?: boolean; disputeStatus?: string; chargeId?: string },
): Promise<boolean> {
  const purchase = await findPurchaseByPaymentRefs(locator);
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

export async function revokeFromPaymentEvent(
  event: RevocationEvent,
  reason: { revoke?: boolean; disputeStatus?: string; chargeId?: string },
): Promise<boolean> {
  return revokePurchaseAccess(revocationEventToLocator(event), reason);
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
