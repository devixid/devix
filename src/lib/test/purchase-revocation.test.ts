import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { getTestMocks } from "@/lib/test/mocks/registry";
import type { RevocationEvent } from "@/lib/payment/types";
import { buildPurchase } from "@/lib/test/mocks/fixtures/purchase";

// ── Prisma mock ────────────────────────────────────────────────────────────────

vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

import {
  revocationEventToLocator,
  revokePurchaseAccess,
  revokeFromPaymentEvent,
  setDisputeStatus,
} from "@/lib/purchase-revocation";

// ── revocationEventToLocator ───────────────────────────────────────────────────

describe("revocationEventToLocator", () => {
  it("maps stripe revocation refs", () => {
    const event: RevocationEvent = {
      provider: "stripe",
      stripePaymentIntentId: "pi_1",
      stripeChargeId: "ch_1",
      stripeSessionId: "cs_1",
    };

    expect(revocationEventToLocator(event)).toEqual({
      stripePaymentIntentId: "pi_1",
      stripeChargeId: "ch_1",
      stripeSessionId: "cs_1",
      lemonSqueezyOrderId: undefined,
    });
  });

  it("maps lemon squeezy order ids", () => {
    expect(
      revocationEventToLocator({
        provider: "lemonsqueezy",
        lemonSqueezyOrderId: "42",
      }),
    ).toEqual({
      stripePaymentIntentId: undefined,
      stripeChargeId: undefined,
      stripeSessionId: undefined,
      lemonSqueezyOrderId: "42",
    });
  });
});

// ── revokePurchaseAccess ───────────────────────────────────────────────────────

describe("revokePurchaseAccess", () => {
  beforeEach(() => {
    resetMockPrisma(getTestMocks().prisma!);
  });

  it("returns false when no matching purchase is found", async () => {
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(null);
    getTestMocks().prisma!.purchase.findFirst.mockResolvedValue(null);

    const result = await revokePurchaseAccess(
      { stripePaymentIntentId: "pi_unknown" },
      { revoke: true },
    );

    expect(result).toBe(false);
    expect(getTestMocks().prisma!.purchase.update).not.toHaveBeenCalled();
  });

  it("sets revokedAt when reason.revoke is true and purchase not already revoked", async () => {
    const purchase = buildPurchase({ revokedAt: null });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(purchase);
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    const result = await revokePurchaseAccess(
      { stripePaymentIntentId: purchase.stripePaymentIntentId! },
      { revoke: true },
    );

    expect(result).toBe(true);
    const updateCall = getTestMocks().prisma!.purchase.update.mock.calls[0][0];
    expect(updateCall.data.revokedAt).toBeInstanceOf(Date);
  });

  it("preserves existing revokedAt (idempotent)", async () => {
    const existingRevocation = new Date("2026-05-01T00:00:00.000Z");
    const purchase = buildPurchase({ revokedAt: existingRevocation });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(purchase);
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    await revokePurchaseAccess(
      { stripePaymentIntentId: purchase.stripePaymentIntentId! },
      { revoke: true },
    );

    const updateCall = getTestMocks().prisma!.purchase.update.mock.calls[0][0];
    // Should use the existing revokedAt, not overwrite with new Date()
    expect(updateCall.data.revokedAt).toEqual(existingRevocation);
  });

  it("sets disputeStatus when provided", async () => {
    const purchase = buildPurchase({ revokedAt: null });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(purchase);
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    await revokePurchaseAccess(
      { stripePaymentIntentId: purchase.stripePaymentIntentId! },
      { disputeStatus: "under_review" },
    );

    const updateCall = getTestMocks().prisma!.purchase.update.mock.calls[0][0];
    expect(updateCall.data.disputeStatus).toBe("under_review");
  });

  it("does not set disputeStatus when not provided", async () => {
    const purchase = buildPurchase({ revokedAt: null });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(purchase);
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    await revokePurchaseAccess(
      { stripePaymentIntentId: purchase.stripePaymentIntentId! },
      { revoke: true },
    );

    const updateCall = getTestMocks().prisma!.purchase.update.mock.calls[0][0];
    expect(updateCall.data.disputeStatus).toBeUndefined();
  });

  it("updates stripeChargeId when provided and not already set", async () => {
    const purchase = buildPurchase({ stripeChargeId: null });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(purchase);
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    await revokePurchaseAccess(
      { stripePaymentIntentId: purchase.stripePaymentIntentId! },
      { chargeId: "ch_new" },
    );

    const updateCall = getTestMocks().prisma!.purchase.update.mock.calls[0][0];
    expect(updateCall.data.stripeChargeId).toBe("ch_new");
  });

  it("does not overwrite existing stripeChargeId", async () => {
    const purchase = buildPurchase({ stripeChargeId: "ch_existing" });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(purchase);
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    await revokePurchaseAccess(
      { stripePaymentIntentId: purchase.stripePaymentIntentId! },
      { chargeId: "ch_new" },
    );

    const updateCall = getTestMocks().prisma!.purchase.update.mock.calls[0][0];
    expect(updateCall.data.stripeChargeId).toBeUndefined();
  });

  it("finds purchase by lemonSqueezyOrderId first", async () => {
    const purchase = buildPurchase({ lemonSqueezyOrderId: "ls_99" });
    getTestMocks().prisma!.purchase.findUnique
      .mockResolvedValueOnce(purchase); // first call: lemonSqueezyOrderId
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    const result = await revokePurchaseAccess(
      { lemonSqueezyOrderId: "ls_99" },
      { revoke: true },
    );

    expect(result).toBe(true);
  });

  it("falls back to findFirst for stripeChargeId", async () => {
    const purchase = buildPurchase({ stripeChargeId: "ch_fallback" });
    // findUnique returns null (no match by paymentIntentId or sessionId)
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(null);
    getTestMocks().prisma!.purchase.findFirst.mockResolvedValue(purchase);
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    const result = await revokePurchaseAccess(
      { stripeChargeId: "ch_fallback" },
      { revoke: true },
    );

    expect(result).toBe(true);
    expect(getTestMocks().prisma!.purchase.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { stripeChargeId: "ch_fallback" },
      }),
    );
  });
});

// ── revokeFromPaymentEvent ─────────────────────────────────────────────────────

describe("revokeFromPaymentEvent", () => {
  beforeEach(() => {
    resetMockPrisma(getTestMocks().prisma!);
  });

  it("delegates to revokePurchaseAccess via the event locator", async () => {
    const purchase = buildPurchase();
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(purchase);
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    const event: RevocationEvent = {
      provider: "stripe",
      stripePaymentIntentId: purchase.stripePaymentIntentId!,
    };

    const result = await revokeFromPaymentEvent(event, { revoke: true });
    expect(result).toBe(true);
  });

  it("returns false when no purchase matches the event", async () => {
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(null);
    getTestMocks().prisma!.purchase.findFirst.mockResolvedValue(null);

    const result = await revokeFromPaymentEvent(
      { provider: "stripe", stripePaymentIntentId: "pi_nope" },
      { revoke: true },
    );

    expect(result).toBe(false);
  });
});

// ── setDisputeStatus ───────────────────────────────────────────────────────────

describe("setDisputeStatus", () => {
  beforeEach(() => {
    resetMockPrisma(getTestMocks().prisma!);
  });

  it("passes disputeStatus and revoke option through", async () => {
    const purchase = buildPurchase({ revokedAt: null });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(purchase);
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    await setDisputeStatus(
      { stripePaymentIntentId: purchase.stripePaymentIntentId! },
      "lost",
      { revoke: true, chargeId: "ch_123" },
    );

    const updateCall = getTestMocks().prisma!.purchase.update.mock.calls[0][0];
    expect(updateCall.data.disputeStatus).toBe("lost");
    expect(updateCall.data.revokedAt).toBeInstanceOf(Date);
    expect(updateCall.data.stripeChargeId).toBe("ch_123");
  });

  it("sets disputeStatus without revoking access when revoke is false", async () => {
    const purchase = buildPurchase({ revokedAt: null });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(purchase);
    getTestMocks().prisma!.purchase.update.mockResolvedValue(purchase);

    await setDisputeStatus(
      { stripePaymentIntentId: purchase.stripePaymentIntentId! },
      "under_review",
      { revoke: false },
    );

    const updateCall = getTestMocks().prisma!.purchase.update.mock.calls[0][0];
    expect(updateCall.data.disputeStatus).toBe("under_review");
    expect(updateCall.data.revokedAt).toBeUndefined();
  });
});
