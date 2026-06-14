import { Decimal } from "@/lib/money";
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { ParsedWebhookEvent } from "@/lib/payment/types";
import type Stripe from "stripe";
import { asId, stripeProvider } from "@/lib/payment/providers/stripe";

// ── Mock Stripe helpers ──
const mockCreateSession = vi.fn();
const mockConstructWebhookEvent = vi.fn();
export const mockListPromotionCodes = vi.fn().mockResolvedValue({ data: [] });

vi.mock("@/lib/stripe", () => ({
  getStripe: vi.fn(() => ({
    checkout: {
      sessions: {
        create: mockCreateSession,
      },
    },
    promotionCodes: {
      list: (...args: any[]) => mockListPromotionCodes(...args),
    },
  })),
  constructWebhookEvent: (body: any, sig: any) => mockConstructWebhookEvent(body, sig),
}));

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

  it("throws when metadata is missing from paid session", () => {
    const session = {
      id: "cs_nometa",
      payment_status: "paid",
      metadata: {},
    } as unknown as Stripe.Checkout.Session;

    expect(() =>
      stripeProvider.toFulfillmentEvent({
        provider: "stripe",
        eventId: "evt_nometa",
        eventType: "checkout.session.completed",
        raw: {
          type: "checkout.session.completed",
          data: { object: session },
        } as Stripe.Event,
      }),
    ).toThrow(/Missing metadata/);
  });

  it("maps payment_intent.succeeded events", () => {
    const pi = {
      id: "pi_test",
      amount_received: 3000,
      currency: "eur",
      latest_charge: "ch_test",
      metadata: {
        productId: "prod_2",
        buyerName: "Buyer 2",
        buyerEmail: "buyer2@example.com",
        buyerIp: "8.8.8.8",
        siteUrl: "https://devix.eu",
      },
    } as unknown as Stripe.PaymentIntent;

    const event = stripeProvider.toFulfillmentEvent({
      provider: "stripe",
      eventId: "evt_pi",
      eventType: "payment_intent.succeeded",
      raw: {
        type: "payment_intent.succeeded",
        data: { object: pi },
      } as Stripe.Event,
    });

    expect(event).toEqual({
      provider: "stripe",
      productId: "prod_2",
      buyerName: "Buyer 2",
      buyerEmail: "buyer2@example.com",
      stripePaymentIntentId: "pi_test",
      stripeChargeId: "ch_test",
      amountMinor: new Decimal("3000"),
      currency: "eur",
      buyerIp: "8.8.8.8",
      userAgent: undefined,
      siteUrl: "https://devix.eu",
    });
  });

  it("returns null for payment_intent.succeeded when metadata is missing", () => {
    const pi = {
      id: "pi_nometa",
      metadata: {},
    } as unknown as Stripe.PaymentIntent;

    const event = stripeProvider.toFulfillmentEvent({
      provider: "stripe",
      eventId: "evt_pi_nometa",
      eventType: "payment_intent.succeeded",
      raw: {
        type: "payment_intent.succeeded",
        data: { object: pi },
      } as Stripe.Event,
    });

    expect(event).toBeNull();
  });

  it("returns null for unhandled stripe event type", () => {
    const event = stripeProvider.toFulfillmentEvent({
      provider: "stripe",
      eventId: "evt_unhandled",
      eventType: "customer.created",
      raw: {
        type: "customer.created",
        data: { object: {} },
      } as Stripe.Event,
    });

    expect(event).toBeNull();
  });
});

describe("stripeProvider.toRevocationEvent", () => {
  it("returns null for unrelated providers", () => {
    expect(
      stripeProvider.toRevocationEvent({
        provider: "lemonsqueezy",
        eventId: "evt_3",
        eventName: "order_refunded",
        raw: {},
      } as ParsedWebhookEvent),
    ).toBeNull();
  });

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

  it("maps charge.dispute.created/closed to revocation refs", () => {
    const dispute = {
      payment_intent: "pi_dispute",
      charge: "ch_dispute",
    } as Stripe.Dispute;

    expect(
      stripeProvider.toRevocationEvent({
        provider: "stripe",
        eventId: "evt_dispute",
        eventType: "charge.dispute.created",
        raw: {
          type: "charge.dispute.created",
          data: { object: dispute },
        } as Stripe.Event,
      }),
    ).toEqual({
      provider: "stripe",
      stripePaymentIntentId: "pi_dispute",
      stripeChargeId: "ch_dispute",
    });
  });

  it("returns null for unhandled revocation event types", () => {
    expect(
      stripeProvider.toRevocationEvent({
        provider: "stripe",
        eventId: "evt_unhandled",
        eventType: "payment_intent.created",
        raw: {
          type: "payment_intent.created",
          data: { object: {} },
        } as Stripe.Event,
      }),
    ).toBeNull();
  });
});

describe("stripeProvider.createCheckout", () => {
  beforeEach(() => {
    mockCreateSession.mockClear();
    mockListPromotionCodes.mockClear();
  });

  const baseParams = {
    productId: "prod_1",
    productName: "Premium Package",
    productDescription: "Best service.",
    amountMinor: new Decimal("5000"),
    currency: "usd",
    buyerEmail: "client@example.com",
    buyerName: "Client",
    baseUrl: "https://site.com",
    ip: "127.0.0.1",
  };

  it("creates embedded checkout session by default", async () => {
    mockCreateSession.mockResolvedValueOnce({
      client_secret: "cs_secret_abc",
    });

    const result = await stripeProvider.createCheckout(baseParams);

    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
      ui_mode: "embedded",
      mode: "payment",
      customer_email: "client@example.com",
      line_items: [{
        quantity: 1,
        price_data: expect.objectContaining({
          currency: "usd",
          unit_amount: 5000,
          product_data: expect.objectContaining({
            name: "Premium Package",
          }),
        }),
      }],
    }), expect.any(Object));

    expect(result).toEqual({ mode: "embedded", clientSecret: "cs_secret_abc" });
  });

  it("throws error if embedded checkout creation lacks client_secret", async () => {
    mockCreateSession.mockResolvedValueOnce({
      client_secret: null,
    });

    await expect(stripeProvider.createCheckout(baseParams)).rejects.toThrow("Could not start embedded checkout");
  });

  it("creates redirect checkout session when redirect mode is requested", async () => {
    mockCreateSession.mockResolvedValueOnce({
      url: "https://checkout.stripe.com/pay/xyz",
    });

    const result = await stripeProvider.createCheckout({
      ...baseParams,
      checkoutMode: "redirect",
    });

    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
      mode: "payment",
      success_url: expect.stringContaining("CHECKOUT_SESSION_ID"),
      cancel_url: expect.stringContaining("store/cancel"),
    }), expect.any(Object));

    expect(result).toEqual({ mode: "redirect", url: "https://checkout.stripe.com/pay/xyz" });
  });

  it("throws error if redirect checkout creation lacks url", async () => {
    mockCreateSession.mockResolvedValueOnce({
      url: null,
    });

    await expect(
      stripeProvider.createCheckout({
        ...baseParams,
        checkoutMode: "redirect",
      }),
    ).rejects.toThrow("Could not start checkout");
  });

  it("resolves and applies coupon code when provided", async () => {
    mockListPromotionCodes.mockResolvedValueOnce({
      data: [{ id: "promo_12345" }],
    });
    mockCreateSession.mockResolvedValueOnce({
      client_secret: "cs_secret_abc",
    });

    const result = await stripeProvider.createCheckout({
      ...baseParams,
      couponCode: "WINTER10",
    });

    expect(mockListPromotionCodes).toHaveBeenCalledWith({
      code: "WINTER10",
      active: true,
      limit: 1,
    });

    expect(mockCreateSession).toHaveBeenCalledWith(expect.objectContaining({
      allow_promotion_codes: true,
      discounts: [{ promotion_code: "promo_12345" }],
    }), expect.any(Object));

    expect(result).toEqual({ mode: "embedded", clientSecret: "cs_secret_abc" });
  });
});

describe("stripeProvider.parseWebhook", () => {
  beforeEach(() => {
    mockConstructWebhookEvent.mockClear();
  });

  it("throws error if stripe-signature header is missing", async () => {
    const request = new Request("https://site.com/webhook", { method: "POST" });
    await expect(stripeProvider.parseWebhook(request)).rejects.toThrow("Missing stripe-signature header");
  });

  it("parses valid webhook request successfully", async () => {
    mockConstructWebhookEvent.mockReturnValueOnce({
      id: "evt_123",
      type: "checkout.session.completed",
    });

    const request = new Request("https://site.com/webhook", {
      method: "POST",
      headers: { "stripe-signature": "sig_abc" },
      body: "raw_payload_body",
    });

    const result = await stripeProvider.parseWebhook(request);

    expect(mockConstructWebhookEvent).toHaveBeenCalledWith("raw_payload_body", "sig_abc");
    expect(result).toEqual({
      provider: "stripe",
      eventId: "evt_123",
      eventType: "checkout.session.completed",
      raw: expect.objectContaining({ id: "evt_123" }),
    });
  });
});
