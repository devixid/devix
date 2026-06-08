import { describe, expect, it } from "vitest";
import { revocationEventToLocator } from "@/lib/purchase-revocation";
import type { RevocationEvent } from "@/lib/payment/types";

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
