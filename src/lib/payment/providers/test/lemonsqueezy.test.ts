import { Decimal } from "@/lib/money";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  buildLemonWebhookEventId,
  lemonOrderWebhookSchema,
  parseLemonOrderWebhook,
} from "@/lib/payment/lemonsqueezy-schema";
import {
  lemonCheckoutIdempotencyKey,
  lemonSqueezyProvider,
} from "@/lib/payment/providers/lemonsqueezy";

// ── SDK and local module mocks ──
vi.mock("@lemonsqueezy/lemonsqueezy.js", () => {
  const createCheckout = vi.fn();
  (globalThis as any).__mockCreateCheckoutSDK = createCheckout;
  return { createCheckout };
});

vi.mock("@/lib/lemonsqueezy", () => {
  const configureLemonSqueezy = vi.fn();
  const getLemonStoreId = vi.fn(() => "store_123");
  const getLemonWebhookSecret = vi.fn(() => "secret_123");
  const verifyLemonSignature = vi.fn(() => true);
  (globalThis as any).__lemonMocks = {
    configureLemonSqueezy,
    getLemonStoreId,
    getLemonWebhookSecret,
    verifyLemonSignature,
  };
  return {
    configureLemonSqueezy,
    getLemonStoreId,
    getLemonWebhookSecret,
    verifyLemonSignature,
  };
});

const mockCreateCheckoutSDK = (globalThis as any).__mockCreateCheckoutSDK;
const mockConfigureLemonSqueezy = (globalThis as any).__lemonMocks.configureLemonSqueezy;
const mockVerifyLemonSignature = (globalThis as any).__lemonMocks.verifyLemonSignature;

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
  it("returns null if provider is not lemonsqueezy", () => {
    const raw = { meta: { event_name: "order_created" }, data: { id: "5", attributes: { status: "paid" } } };
    expect(lemonSqueezyProvider.toFulfillmentEvent({
      provider: "stripe",
      eventId: "id",
      eventType: "charge.succeeded",
      raw,
    })).toBeNull();
  });

  it("returns null if event name is not order_created", () => {
    const raw = {
      meta: { event_name: "order_updated" },
      data: { id: "5", type: "orders", attributes: { status: "paid", total: 750, currency: "usd", user_name: "Buyer", user_email: "buyer@example.com" } }
    };
    expect(lemonSqueezyProvider.toFulfillmentEvent({
      provider: "lemonsqueezy",
      eventId: "id",
      eventName: "order_updated",
      raw,
    })).toBeNull();
  });

  it("returns null if status is not paid", () => {
    const raw = {
      meta: { event_name: "order_created" },
      data: { id: "5", type: "orders", attributes: { status: "pending", total: 750, currency: "usd", user_name: "Buyer", user_email: "buyer@example.com" } }
    };
    expect(lemonSqueezyProvider.toFulfillmentEvent({
      provider: "lemonsqueezy",
      eventId: "id",
      eventName: "order_created",
      raw,
    })).toBeNull();
  });

  it("throws error if custom data is missing details", () => {
    const raw = {
      meta: { event_name: "order_created" },
      data: {
        id: "5",
        type: "orders",
        attributes: { status: "paid", total: 750, currency: "usd", user_name: "Buyer", user_email: "buyer@example.com" }
      }
    };
    expect(() => lemonSqueezyProvider.toFulfillmentEvent({
      provider: "lemonsqueezy",
      eventId: "id",
      eventName: "order_created",
      raw,
    })).toThrow(/Missing custom_data/);
  });

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
  it("returns null if provider is not lemonsqueezy", () => {
    const raw = { meta: { event_name: "order_refunded" }, data: { id: "9" } };
    expect(lemonSqueezyProvider.toRevocationEvent({
      provider: "stripe",
      eventId: "id",
      eventType: "charge.refunded",
      raw,
    })).toBeNull();
  });

  it("returns null if eventName is not order_refunded", () => {
    const raw = { meta: { event_name: "order_created" }, data: { id: "9" } };
    expect(lemonSqueezyProvider.toRevocationEvent({
      provider: "lemonsqueezy",
      eventId: "id",
      eventName: "order_created",
      raw,
    })).toBeNull();
  });

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

describe("lemonSqueezyProvider.createCheckout", () => {
  beforeEach(() => {
    mockCreateCheckoutSDK.mockClear();
    mockConfigureLemonSqueezy.mockClear();
  });

  const baseParams = {
    productId: "prod_1",
    productName: "Pro Starter",
    productDescription: "A great pack.",
    amountMinor: new Decimal("1000"),
    currency: "usd",
    buyerEmail: "john@example.com",
    buyerName: "John Doe",
    baseUrl: "https://site.com",
    ip: "127.0.0.1",
    lemonSqueezyVariantId: "var_99",
  };

  it("throws error if variant ID is missing", async () => {
    await expect(
      lemonSqueezyProvider.createCheckout({
        ...baseParams,
        lemonSqueezyVariantId: undefined,
      }),
    ).rejects.toThrow("configured for Lemon Squeezy");
  });

  it("calls setup config and returns overlay checkout type by default", async () => {
    mockCreateCheckoutSDK.mockResolvedValueOnce({
      data: { data: { attributes: { url: "https://ls.checkout/embed" } } },
      error: null,
    });

    const result = await lemonSqueezyProvider.createCheckout(baseParams);

    expect(mockConfigureLemonSqueezy).toHaveBeenCalled();
    expect(mockCreateCheckoutSDK).toHaveBeenCalledWith("store_123", "var_99", expect.objectContaining({
      checkoutOptions: { embed: true },
      checkoutData: expect.objectContaining({
        email: "john@example.com",
        name: "John Doe",
      }),
    }));

    expect(result).toEqual({ mode: "overlay", url: "https://ls.checkout/embed" });
  });

  it("returns redirect checkout type when redirect mode is requested", async () => {
    mockCreateCheckoutSDK.mockResolvedValueOnce({
      data: { data: { attributes: { url: "https://ls.checkout/redirect" } } },
      error: null,
    });

    const result = await lemonSqueezyProvider.createCheckout({
      ...baseParams,
      checkoutMode: "redirect",
    });

    expect(mockCreateCheckoutSDK).toHaveBeenCalledWith("store_123", "var_99", expect.objectContaining({
      checkoutOptions: { embed: false },
    }));

    expect(result).toEqual({ mode: "redirect", url: "https://ls.checkout/redirect" });
  });

  it("throws error if SDK returns an error", async () => {
    mockCreateCheckoutSDK.mockResolvedValueOnce({
      data: null,
      error: new Error("SDK timeout"),
    });

    await expect(lemonSqueezyProvider.createCheckout(baseParams)).rejects.toThrow("SDK timeout");
  });

  it("throws error if URL is missing in SDK attributes", async () => {
    mockCreateCheckoutSDK.mockResolvedValueOnce({
      data: { data: { attributes: { url: null } } },
      error: null,
    });

    await expect(lemonSqueezyProvider.createCheckout(baseParams)).rejects.toThrow("Could not start Lemon Squeezy");
  });

  it("forwards couponCode to SDK discountCode when provided", async () => {
    mockCreateCheckoutSDK.mockResolvedValueOnce({
      data: { data: { attributes: { url: "https://ls.checkout/embed" } } },
      error: null,
    });

    const result = await lemonSqueezyProvider.createCheckout({
      ...baseParams,
      couponCode: "WINTER10",
    });

    expect(mockCreateCheckoutSDK).toHaveBeenCalledWith("store_123", "var_99", expect.objectContaining({
      checkoutData: expect.objectContaining({
        discountCode: "WINTER10",
      }),
    }));

    expect(result).toEqual({ mode: "overlay", url: "https://ls.checkout/embed" });
  });
});

describe("lemonSqueezyProvider.parseWebhook", () => {
  beforeEach(() => {
    mockVerifyLemonSignature.mockClear();
  });

  it("throws error if x-signature header is missing", async () => {
    const request = new Request("https://site.com/webhook", { method: "POST" });
    await expect(lemonSqueezyProvider.parseWebhook(request)).rejects.toThrow("Missing X-Signature header");
  });

  it("throws error if signature verification fails", async () => {
    mockVerifyLemonSignature.mockReturnValueOnce(false);
    const request = new Request("https://site.com/webhook", {
      method: "POST",
      headers: { "x-signature": "bad_sig" },
      body: JSON.stringify({ meta: { event_name: "order_created" } }),
    });

    await expect(lemonSqueezyProvider.parseWebhook(request)).rejects.toThrow("Invalid Lemon Squeezy webhook signature");
  });

  it("parses valid webhook body and returnsParsedEvent", async () => {
    mockVerifyLemonSignature.mockReturnValueOnce(true);
    const body = {
      meta: { event_name: "order_created" },
      data: {
        id: 105,
        type: "orders",
        attributes: {
          status: "paid",
          total: 500,
          currency: "eur",
          user_name: "Bob",
          user_email: "bob@example.com",
        },
      },
    };
    const request = new Request("https://site.com/webhook", {
      method: "POST",
      headers: { "x-signature": "good_sig" },
      body: JSON.stringify(body),
    });

    const result = await lemonSqueezyProvider.parseWebhook(request);
    expect(result).toEqual({
      provider: "lemonsqueezy",
      eventId: "lemonsqueezy:105:order_created",
      eventName: "order_created",
      raw: expect.objectContaining({
        data: expect.objectContaining({ id: "105" }),
      }),
    });
  });
});
