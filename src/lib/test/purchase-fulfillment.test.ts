import { describe, expect, it } from "vitest";
import { fulfillmentEventToInput } from "@/lib/purchase-fulfillment";
import type { FulfillmentEvent } from "@/lib/payment/types";

describe("fulfillmentEventToInput", () => {
  it("maps stripe fulfillment events", () => {
    const event: FulfillmentEvent = {
      provider: "stripe",
      productId: "prod_1",
      buyerName: "Buyer",
      buyerEmail: "buyer@example.com",
      stripeSessionId: "cs_test",
      stripePaymentIntentId: "pi_test",
      amountMinor: 2500,
      currency: "usd",
      buyerIp: "127.0.0.1",
      userAgent: "vitest",
      siteUrl: "https://devix.test",
    };

    expect(fulfillmentEventToInput(event)).toEqual({
      provider: "stripe",
      productId: "prod_1",
      buyerName: "Buyer",
      buyerEmail: "buyer@example.com",
      stripeSessionId: "cs_test",
      stripePaymentIntentId: "pi_test",
      stripeChargeId: undefined,
      lemonSqueezyOrderId: undefined,
      amountMinor: 2500,
      currency: "usd",
      buyerIp: "127.0.0.1",
      userAgent: "vitest",
      siteUrl: "https://devix.test",
    });
  });

  it("maps lemon squeezy fulfillment events", () => {
    const event: FulfillmentEvent = {
      provider: "lemonsqueezy",
      productId: "prod_2",
      buyerName: "Jane",
      buyerEmail: "jane@example.com",
      lemonSqueezyOrderId: "99",
    };

    expect(fulfillmentEventToInput(event).lemonSqueezyOrderId).toBe("99");
    expect(fulfillmentEventToInput(event).stripeSessionId).toBeUndefined();
  });
});
