import { Decimal } from "@/lib/money";
import { describe, expect, it } from "vitest";
import { createHmac } from "node:crypto";
import { verifyLemonSignature } from "@/lib/lemonsqueezy";
import {
  buildLemonWebhookEventId,
  lemonOrderWebhookSchema,
} from "@/lib/payment/lemonsqueezy-schema";
import { lemonSqueezyProvider } from "@/lib/payment/providers/lemonsqueezy";
import { getPaymentProviderIdFromEnv } from "@/lib/payment/config";

const SECRET = "test-signing-secret";

function signBody(body: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("verifyLemonSignature", () => {
  it("accepts a valid signature", () => {
    const body = '{"meta":{"event_name":"order_created"}}';
    expect(verifyLemonSignature(body, signBody(body), SECRET)).toBe(true);
  });

  it("rejects an invalid signature", () => {
    const body = '{"meta":{"event_name":"order_created"}}';
    expect(verifyLemonSignature(body, "deadbeef", SECRET)).toBe(false);
  });

  it("rejects signatures with wrong length safely", () => {
    const body = '{"meta":{"event_name":"order_created"}}';
    expect(verifyLemonSignature(body, "short", SECRET)).toBe(false);
  });
});

describe("lemonOrderWebhookSchema", () => {
  it("parses a paid order_created payload", () => {
    const payload = {
      meta: {
        event_name: "order_created",
        custom_data: {
          productId: "prod_123",
          buyerName: "Jane Doe",
          siteUrl: "https://example.com",
        },
      },
      data: {
        id: "42",
        type: "orders",
        attributes: {
          status: "paid",
          total: 1999,
          currency: "USD",
          user_name: "Jane Doe",
          user_email: "jane@example.com",
        },
      },
    };

    const parsed = lemonOrderWebhookSchema.parse(payload);
    expect(parsed.data.id).toBe("42");
    expect(parsed.meta.custom_data?.productId).toBe("prod_123");
  });
});

describe("buildLemonWebhookEventId", () => {
  it("builds a stable synthetic id", () => {
    expect(buildLemonWebhookEventId("99", "order_created")).toBe(
      "lemonsqueezy:99:order_created",
    );
  });
});

describe("lemonSqueezyProvider.toFulfillmentEvent", () => {
  it("maps paid order_created to FulfillmentEvent", () => {
    const raw = lemonOrderWebhookSchema.parse({
      meta: {
        event_name: "order_created",
        custom_data: {
          productId: "prod_abc",
          buyerName: "Buyer",
          siteUrl: "https://devix.test",
          buyerIp: "127.0.0.1",
          userAgent: "vitest",
        },
      },
      data: {
        id: "7",
        type: "orders",
        attributes: {
          status: "paid",
          total: 500,
          currency: "usd",
          user_name: "Buyer",
          user_email: "buyer@example.com",
        },
      },
    });

    const event = lemonSqueezyProvider.toFulfillmentEvent({
      provider: "lemonsqueezy",
      eventId: buildLemonWebhookEventId("7", "order_created"),
      eventName: "order_created",
      raw,
    });

    expect(event).toEqual({
      provider: "lemonsqueezy",
      productId: "prod_abc",
      buyerName: "Buyer",
      buyerEmail: "buyer@example.com",
      lemonSqueezyOrderId: "7",
      amountMinor: new Decimal("500"),
      currency: "usd",
      buyerIp: "127.0.0.1",
      userAgent: "vitest",
      siteUrl: "https://devix.test",
    });
  });

  it("returns null for unpaid orders", () => {
    const raw = lemonOrderWebhookSchema.parse({
      meta: { event_name: "order_created" },
      data: {
        id: "8",
        type: "orders",
        attributes: {
          status: "pending",
          total: 500,
          currency: "usd",
          user_name: "Buyer",
          user_email: "buyer@example.com",
        },
      },
    });

    expect(
      lemonSqueezyProvider.toFulfillmentEvent({
        provider: "lemonsqueezy",
        eventId: buildLemonWebhookEventId("8", "order_created"),
        eventName: "order_created",
        raw,
      }),
    ).toBeNull();
  });
});

describe("getPaymentProviderIdFromEnv", () => {
  it("defaults to stripe when unset", () => {
    const previous = process.env.PAYMENT_PROVIDER;
    delete process.env.PAYMENT_PROVIDER;
    expect(getPaymentProviderIdFromEnv()).toBe("stripe");
    process.env.PAYMENT_PROVIDER = previous;
  });

  it("throws on invalid provider", () => {
    const previous = process.env.PAYMENT_PROVIDER;
    process.env.PAYMENT_PROVIDER = "paypal";
    expect(() => getPaymentProviderIdFromEnv()).toThrow(/Invalid PAYMENT_PROVIDER/);
    process.env.PAYMENT_PROVIDER = previous;
  });
});
