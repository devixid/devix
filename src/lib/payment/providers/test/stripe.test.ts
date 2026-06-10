import { Decimal } from "@/lib/money";
import { describe, expect, it } from "vitest";
import type { ParsedWebhookEvent } from "@/lib/payment/types";
import type Stripe from "stripe";
import { asId, stripeProvider } from "@/lib/payment/providers/stripe";

describe("asId", () => {
  it("returns string ids unchanged", () => {
    expect(asId("pi_123")).toBe("pi_123");
  });

  it("extracts id from stripe objects", () => {
    expect(asId({ id: "pi_456" } as Stripe.PaymentIntent)).toBe("pi_456");
  });

  it("returns undefined for empty values", () => {
    expect(asId(null)).toBeUndefined();
  });
});

describe("stripeProvider.toFulfillmentEvent", () => {
  it("maps paid checkout.session.completed events", () => {
    const session = {
      id: "cs_test",
      payment_status: "paid",
      amount_total: 2500,
      currency: "usd",
      metadata: {
        productId: "prod_1",
        buyerName: "Buyer",
        buyerEmail: "buyer@example.com",
        buyerIp: "127.0.0.1",
        userAgent: "vitest",
        siteUrl: "https://devix.test",
      },
      payment_intent: "pi_test",
    } as unknown as Stripe.Checkout.Session;

    const event = stripeProvider.toFulfillmentEvent({
      provider: "stripe",
      eventId: "evt_1",
      eventType: "checkout.session.completed",
      raw: {
        type: "checkout.session.completed",
        data: { object: session },
      } as Stripe.Event,
    });

    expect(event).toEqual({
      provider: "stripe",
      productId: "prod_1",
      buyerName: "Buyer",
      buyerEmail: "buyer@example.com",
      stripeSessionId: "cs_test",
      stripePaymentIntentId: "pi_test",
      amountMinor: new Decimal("2500"),
      currency: "usd",
      buyerIp: "127.0.0.1",
      userAgent: "vitest",
      siteUrl: "https://devix.test",
    });
  });

  it("returns null for unpaid sessions", () => {
    const session = {
      id: "cs_unpaid",
      payment_status: "unpaid",
      metadata: {
        productId: "prod_1",
        buyerName: "Buyer",
        buyerEmail: "buyer@example.com",
      },
    } as unknown as Stripe.Checkout.Session;

    expect(
      stripeProvider.toFulfillmentEvent({
        provider: "stripe",
        eventId: "evt_2",
        eventType: "checkout.session.completed",
        raw: {
          type: "checkout.session.completed",
          data: { object: session },
        } as Stripe.Event,
      }),
    ).toBeNull();
  });

  it("returns null for unrelated providers", () => {
    expect(
      stripeProvider.toFulfillmentEvent({
        provider: "lemonsqueezy",
        eventId: "evt_3",
        eventName: "order_created",
        raw: {},
      } as ParsedWebhookEvent),
    ).toBeNull();
  });
});

describe("stripeProvider.toRevocationEvent", () => {
  it("maps charge.refunded to revocation refs", () => {
    const charge = {
      payment_intent: "pi_refund",
      id: "ch_refund",
    } as Stripe.Charge;

    expect(
      stripeProvider.toRevocationEvent({
        provider: "stripe",
        eventId: "evt_4",
        eventType: "charge.refunded",
        raw: {
          type: "charge.refunded",
          data: { object: charge },
        } as Stripe.Event,
      }),
    ).toEqual({
      provider: "stripe",
      stripePaymentIntentId: "pi_refund",
      stripeChargeId: "ch_refund",
    });
  });
});

