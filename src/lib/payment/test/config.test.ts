import { describe, expect, it } from "vitest";
import {
  PAYMENT_PROVIDERS,
  isPaymentProviderId,
} from "@/lib/payment/constants";
import {
  getPaymentProviderIdFromEnv,
  getPaymentProviderStatus,
} from "@/lib/payment/config";

describe("isPaymentProviderId", () => {
  it("accepts supported provider ids", () => {
    for (const id of PAYMENT_PROVIDERS) {
      expect(isPaymentProviderId(id)).toBe(true);
    }
    expect(isPaymentProviderId("paypal")).toBe(false);
  });
});

describe("getPaymentProviderIdFromEnv", () => {
  it("defaults to stripe when unset", () => {
    const previous = process.env.PAYMENT_PROVIDER;
    delete process.env.PAYMENT_PROVIDER;
    expect(getPaymentProviderIdFromEnv()).toBe("stripe");
    process.env.PAYMENT_PROVIDER = previous;
  });
});

describe("getPaymentProviderStatus", () => {
  it("reports missing stripe env vars", () => {
    const prevSecret = process.env.STRIPE_SECRET_KEY;
    const prevWebhook = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRETS;

    const status = getPaymentProviderStatus("stripe");
    expect(status.configured).toBe(false);
    expect(status.missing).toContain("STRIPE_SECRET_KEY");
    expect(status.missing).toContain("STRIPE_WEBHOOK_SECRET");

    process.env.STRIPE_SECRET_KEY = prevSecret;
    process.env.STRIPE_WEBHOOK_SECRET = prevWebhook;
  });
});
