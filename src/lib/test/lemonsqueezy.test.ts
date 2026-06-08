import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertLemonSqueezyEnv,
  isLemonSqueezyConfigured,
  verifyLemonSignature,
} from "@/lib/lemonsqueezy";

const SECRET = "test-lemon-secret";

function signBody(body: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("isLemonSqueezyConfigured", () => {
  afterEach(() => {
    delete process.env.LEMONSQUEEZY_API_KEY;
    delete process.env.LEMONSQUEEZY_STORE_ID;
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  });

  it("requires api key, store id, and webhook secret", () => {
    expect(isLemonSqueezyConfigured()).toBe(false);
    process.env.LEMONSQUEEZY_API_KEY = "key";
    process.env.LEMONSQUEEZY_STORE_ID = "123";
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "secret";
    expect(isLemonSqueezyConfigured()).toBe(true);
  });
});

describe("verifyLemonSignature", () => {
  it("validates HMAC signatures", () => {
    const body = '{"meta":{"event_name":"order_created"}}';
    expect(verifyLemonSignature(body, signBody(body), SECRET)).toBe(true);
    expect(verifyLemonSignature(body, "bad-signature", SECRET)).toBe(false);
  });
});

describe("assertLemonSqueezyEnv", () => {
  afterEach(() => {
    delete process.env.LEMONSQUEEZY_API_KEY;
    delete process.env.LEMONSQUEEZY_STORE_ID;
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  });

  it("lists missing env vars", () => {
    expect(assertLemonSqueezyEnv()).toEqual([
      "LEMONSQUEEZY_API_KEY missing.",
      "LEMONSQUEEZY_STORE_ID missing.",
      "LEMONSQUEEZY_WEBHOOK_SECRET missing.",
    ]);
  });
});
