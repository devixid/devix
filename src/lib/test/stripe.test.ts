import { afterEach, describe, expect, it } from "vitest";
import {
  assertStripeEnv,
  getWebhookSecrets,
  isStripeConfigured,
} from "@/lib/stripe";

describe("isStripeConfigured", () => {
  it("checks STRIPE_SECRET_KEY presence", () => {
    const previous = process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_SECRET_KEY;
    expect(isStripeConfigured()).toBe(false);
    process.env.STRIPE_SECRET_KEY = "sk_test_example";
    expect(isStripeConfigured()).toBe(true);
    process.env.STRIPE_SECRET_KEY = previous;
  });
});

describe("getWebhookSecrets", () => {
  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRETS;
  });

  it("parses comma-separated rotation secrets", () => {
    process.env.STRIPE_WEBHOOK_SECRETS = "whsec_a, whsec_b";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_c";
    expect(getWebhookSecrets()).toEqual(["whsec_a", "whsec_b", "whsec_c"]);
  });
});

describe("assertStripeEnv", () => {
  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRETS;
    delete process.env.VERCEL_ENV;
  });

  it("reports mode mismatches between secret and publishable keys", () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRETS;
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_live_abc";

    const problems = assertStripeEnv();
    expect(problems.some((p) => p.includes("different modes"))).toBe(true);
    expect(problems.some((p) => p.includes("WEBHOOK"))).toBe(true);
  });
});
