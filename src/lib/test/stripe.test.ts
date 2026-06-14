import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertStripeEnv,
  getWebhookSecrets,
  isStripeConfigured,
  constructWebhookEvent,
} from "@/lib/stripe";

// ── isStripeConfigured ─────────────────────────────────────────────────────────

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

// ── getWebhookSecrets ──────────────────────────────────────────────────────────

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

  it("returns empty array when no secrets configured", () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRETS;
    expect(getWebhookSecrets()).toEqual([]);
  });

  it("trims whitespace from individual secrets", () => {
    process.env.STRIPE_WEBHOOK_SECRETS = "  whsec_x  ,  whsec_y  ";
    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(getWebhookSecrets()).toEqual(["whsec_x", "whsec_y"]);
  });
});

// ── getStripe ──────────────────────────────────────────────────────────────────

describe("getStripe", () => {
  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    vi.resetModules();
  });

  it("throws when STRIPE_SECRET_KEY is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { getStripe: freshGet } = await import("@/lib/stripe");
    expect(() => freshGet()).toThrow(/STRIPE_SECRET_KEY/);
  });

  it("returns a Stripe instance when key is configured", async () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_vitest";
    const { getStripe: freshGet } = await import("@/lib/stripe");
    const stripe = freshGet();
    expect(stripe).toBeDefined();
    expect(typeof stripe.paymentIntents).toBe("object");
  });
});

// ── assertStripeEnv ────────────────────────────────────────────────────────────

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

  it("reports STRIPE_SECRET_KEY missing", () => {
    delete process.env.STRIPE_SECRET_KEY;

    const problems = assertStripeEnv();
    expect(problems.some((p) => p.includes("STRIPE_SECRET_KEY missing"))).toBe(true);
  });

  it("reports test key used in production", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";
    process.env.VERCEL_ENV = "production";

    const problems = assertStripeEnv();
    expect(problems.some((p) => p.includes("TEST Stripe secret key"))).toBe(true);
  });

  it("reports live key used in non-production", () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_abc";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";
    process.env.VERCEL_ENV = "preview";

    const problems = assertStripeEnv();
    expect(problems.some((p) => p.includes("LIVE Stripe secret key"))).toBe(true);
  });

  it("reports key with unexpected prefix", () => {
    process.env.STRIPE_SECRET_KEY = "sk_unknown_abc";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";

    const problems = assertStripeEnv();
    expect(problems.some((p) => p.includes("unexpected prefix"))).toBe(true);
  });

  it("reports no webhook secrets configured", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRETS;

    const problems = assertStripeEnv();
    expect(problems.some((p) => p.includes("WEBHOOK"))).toBe(true);
  });

  it("passes with no problems for a valid test configuration", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_abc";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_test_abc";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";

    const problems = assertStripeEnv();
    expect(problems).toHaveLength(0);
  });

  it("passes with no problems for a valid live configuration", () => {
    process.env.STRIPE_SECRET_KEY = "sk_live_abc";
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = "pk_live_abc";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_abc";
    process.env.VERCEL_ENV = "production";

    const problems = assertStripeEnv();
    expect(problems).toHaveLength(0);
  });
});

// ── constructWebhookEvent ──────────────────────────────────────────────────────

describe("constructWebhookEvent", () => {
  afterEach(() => {
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRETS;
    vi.resetModules();
  });

  it("throws when no webhook secrets are configured", () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRETS;
    process.env.STRIPE_SECRET_KEY = "sk_test_vitest";

    expect(() => constructWebhookEvent("payload", "sig")).toThrow(
      /No Stripe webhook secret configured/,
    );
  });

  it("throws when signature verification fails for all secrets", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_vitest";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_bad";

    expect(() => constructWebhookEvent("payload", "bad_sig")).toThrow();
  });
});
