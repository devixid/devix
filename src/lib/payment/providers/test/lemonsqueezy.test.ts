import { Decimal } from "@/lib/money";
import { describe, expect, it, vi } from "vitest";
import {
  buildLemonWebhookEventId,
  lemonOrderWebhookSchema,
  parseLemonOrderWebhook,
} from "@/lib/payment/lemonsqueezy-schema";
import {
  lemonCheckoutIdempotencyKey,
  lemonSqueezyProvider,
} from "@/lib/payment/providers/lemonsqueezy";

describe("parseLemonOrderWebhook", () => {
  it("parses numeric order ids as strings", () => {
    const payload = parseLemonOrderWebhook({
      meta: { event_name: "order_created" },
      data: {
        id: 99,
        type: "orders",
        attributes: {
          status: "paid",
          total: 1000,
          currency: "usd",
          user_name: "Buyer",
          user_email: "buyer@example.com",
        },
      },
    });
    expect(payload.data.id).toBe("99");
  });
});

describe("buildLemonWebhookEventId", () => {
  it("builds deterministic provider-scoped ids", () => {
    expect(buildLemonWebhookEventId("42", "order_created")).toBe(
      "lemonsqueezy:42:order_created",
    );
  });
});

describe("lemonSqueezyProvider.toFulfillmentEvent", () => {
  it("maps paid Lemon Squeezy orders", () => {
    const raw = lemonOrderWebhookSchema.parse({
      meta: {
        event_name: "order_created",
        custom_data: {
          productId: "prod_ls",
          buyerName: "Buyer",
          siteUrl: "https://devix.test",
        },
      },
      data: {
        id: "5",
        type: "orders",
        attributes: {
          status: "paid",
          total: 750,
          currency: "usd",
          user_name: "Buyer",
          user_email: "buyer@example.com",
        },
      },
    });

    expect(
      lemonSqueezyProvider.toFulfillmentEvent({
        provider: "lemonsqueezy",
        eventId: buildLemonWebhookEventId("5", "order_created"),
        eventName: "order_created",
        raw,
      }),
    ).toEqual({
      provider: "lemonsqueezy",
      productId: "prod_ls",
      buyerName: "Buyer",
      buyerEmail: "buyer@example.com",
      lemonSqueezyOrderId: "5",
      amountMinor: new Decimal("750"),
      currency: "usd",
      buyerIp: undefined,
      userAgent: undefined,
      siteUrl: "https://devix.test",
    });
  });
});

describe("lemonCheckoutIdempotencyKey", () => {
  it("returns a stable sha256 hex digest", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-08T12:00:00.000Z"));

    const key = lemonCheckoutIdempotencyKey({
      productId: "prod_1",
      buyerEmail: "Buyer@Example.com",
      buyerName: "Buyer",
      productName: "Kit",
      productDescription: "Desc",
      amountMinor: new Decimal("1000"),
      currency: "usd",
      baseUrl: "https://devix.test",
      ip: "127.0.0.1",
    });

    expect(key).toMatch(/^[a-f0-9]{64}$/);

    vi.useRealTimers();
  });
});

describe("lemonSqueezyProvider.toRevocationEvent", () => {
  it("maps refunded orders to lemon order id", () => {
    const raw = lemonOrderWebhookSchema.parse({
      meta: { event_name: "order_refunded" },
      data: {
        id: "9",
        type: "orders",
        attributes: {
          status: "refunded",
          total: 750,
          currency: "usd",
          user_name: "Buyer",
          user_email: "buyer@example.com",
        },
      },
    });

    expect(
      lemonSqueezyProvider.toRevocationEvent({
        provider: "lemonsqueezy",
        eventId: buildLemonWebhookEventId("9", "order_refunded"),
        eventName: "order_refunded",
        raw,
      }),
    ).toEqual({
      provider: "lemonsqueezy",
      lemonSqueezyOrderId: "9",
    });
  });
});
