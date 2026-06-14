import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  PAYMENT_PROVIDERS,
  isPaymentProviderId,
} from "@/lib/payment/constants";
import {
  getPaymentProviderIdFromEnv,
  getPaymentProviderStatus,
  resolvePaymentProviderId,
} from "@/lib/payment/config";

// ── site-settings mock ─────────────────────────────────────────────────────────

vi.mock("@/lib/site-settings", () => ({
  getSiteSettings: vi.fn(),
}));

import { getSiteSettings } from "@/lib/site-settings";
const mockedGetSiteSettings = getSiteSettings as any;

// ── isPaymentProviderId ────────────────────────────────────────────────────────

describe("isPaymentProviderId", () => {
  it("accepts supported provider ids", () => {
    for (const id of PAYMENT_PROVIDERS) {
      expect(isPaymentProviderId(id)).toBe(true);
    }
    expect(isPaymentProviderId("paypal")).toBe(false);
  });

  it("is case-sensitive (uppercase invalid)", () => {
    expect(isPaymentProviderId("Stripe")).toBe(false);
  });
});

// ── getPaymentProviderIdFromEnv ────────────────────────────────────────────────

describe("getPaymentProviderIdFromEnv", () => {
  afterEach(() => {
    delete process.env.PAYMENT_PROVIDER;
  });

  it("defaults to stripe when unset", () => {
    delete process.env.PAYMENT_PROVIDER;
    expect(getPaymentProviderIdFromEnv()).toBe("stripe");
  });

  it("reads 'lemonsqueezy' from env", () => {
    process.env.PAYMENT_PROVIDER = "lemonsqueezy";
    expect(getPaymentProviderIdFromEnv()).toBe("lemonsqueezy");
  });

  it("throws for an invalid PAYMENT_PROVIDER value", () => {
    process.env.PAYMENT_PROVIDER = "paypal";
    expect(() => getPaymentProviderIdFromEnv()).toThrow(/Invalid PAYMENT_PROVIDER/);
  });
});

// ── resolvePaymentProviderId ───────────────────────────────────────────────────

describe("resolvePaymentProviderId", () => {
  beforeEach(() => {
    mockedGetSiteSettings.mockReset();
    delete process.env.PAYMENT_PROVIDER;
  });

  afterEach(() => {
    delete process.env.PAYMENT_PROVIDER;
  });

  it("returns provider from SiteSettings when valid", async () => {
    mockedGetSiteSettings.mockResolvedValue({
      paymentProvider: "lemonsqueezy",
      notificationEmail: null,
      siteName: null,
      siteUrl: null,
      metaDescription: null,
      socialLinks: null,
      maintenanceMode: false,
      maintenanceMessage: null,
    });

    const result = await resolvePaymentProviderId();
    expect(result).toBe("lemonsqueezy");
  });

  it("falls back to PAYMENT_PROVIDER env when SiteSettings returns null", async () => {
    mockedGetSiteSettings.mockResolvedValue(null);
    process.env.PAYMENT_PROVIDER = "lemonsqueezy";

    const result = await resolvePaymentProviderId();
    expect(result).toBe("lemonsqueezy");
  });

  it("falls back to 'stripe' as default when settings and env are absent", async () => {
    mockedGetSiteSettings.mockResolvedValue(null);
    delete process.env.PAYMENT_PROVIDER;

    const result = await resolvePaymentProviderId();
    expect(result).toBe("stripe");
  });

  it("falls back gracefully when getSiteSettings throws", async () => {
    mockedGetSiteSettings.mockRejectedValue(new Error("DB connection failed"));
    process.env.PAYMENT_PROVIDER = "stripe";

    const result = await resolvePaymentProviderId();
    expect(result).toBe("stripe");
  });

  it("ignores invalid paymentProvider value from SiteSettings", async () => {
    mockedGetSiteSettings.mockResolvedValue({
      paymentProvider: "paypal",
      notificationEmail: null,
      siteName: null,
      siteUrl: null,
      metaDescription: null,
      socialLinks: null,
      maintenanceMode: false,
      maintenanceMessage: null,
    });
    delete process.env.PAYMENT_PROVIDER;

    const result = await resolvePaymentProviderId();
    expect(result).toBe("stripe");
  });
});

// ── getPaymentProviderStatus — Stripe ─────────────────────────────────────────

describe("getPaymentProviderStatus — stripe", () => {
  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRETS;
  });

  it("reports missing stripe env vars", () => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRETS;

    const status = getPaymentProviderStatus("stripe");
    expect(status.configured).toBe(false);
    expect(status.missing).toContain("STRIPE_SECRET_KEY");
    expect(status.missing).toContain("STRIPE_WEBHOOK_SECRET");
  });

  it("reports configured when all stripe vars are present", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";

    const status = getPaymentProviderStatus("stripe");
    expect(status.configured).toBe(true);
    expect(status.missing).toHaveLength(0);
  });

  it("accepts STRIPE_WEBHOOK_SECRETS as alternative to STRIPE_WEBHOOK_SECRET", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    delete process.env.STRIPE_WEBHOOK_SECRET;
    process.env.STRIPE_WEBHOOK_SECRETS = "whsec_a,whsec_b";

    const status = getPaymentProviderStatus("stripe");
    expect(status.configured).toBe(true);
  });
});

// ── getPaymentProviderStatus — LemonSqueezy ───────────────────────────────────

describe("getPaymentProviderStatus — lemonsqueezy", () => {
  afterEach(() => {
    delete process.env.LEMONSQUEEZY_API_KEY;
    delete process.env.LEMONSQUEEZY_STORE_ID;
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  });

  it("reports missing lemonsqueezy env vars when all absent", () => {
    delete process.env.LEMONSQUEEZY_API_KEY;
    delete process.env.LEMONSQUEEZY_STORE_ID;
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    const status = getPaymentProviderStatus("lemonsqueezy");
    expect(status.configured).toBe(false);
    expect(status.missing).toContain("LEMONSQUEEZY_API_KEY");
    expect(status.missing).toContain("LEMONSQUEEZY_STORE_ID");
    expect(status.missing).toContain("LEMONSQUEEZY_WEBHOOK_SECRET");
  });

  it("reports configured when all lemonsqueezy vars are present", () => {
    process.env.LEMONSQUEEZY_API_KEY = "lsq_test_key";
    process.env.LEMONSQUEEZY_STORE_ID = "store_123";
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "whsec_lsq_123";

    const status = getPaymentProviderStatus("lemonsqueezy");
    expect(status.configured).toBe(true);
    expect(status.missing).toHaveLength(0);
    expect(status.id).toBe("lemonsqueezy");
  });

  it("reports partial missing vars", () => {
    process.env.LEMONSQUEEZY_API_KEY = "lsq_test_key";
    delete process.env.LEMONSQUEEZY_STORE_ID;
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

    const status = getPaymentProviderStatus("lemonsqueezy");
    expect(status.configured).toBe(false);
    expect(status.missing).toContain("LEMONSQUEEZY_STORE_ID");
    expect(status.missing).toContain("LEMONSQUEEZY_WEBHOOK_SECRET");
    expect(status.missing).not.toContain("LEMONSQUEEZY_API_KEY");
  });
});
