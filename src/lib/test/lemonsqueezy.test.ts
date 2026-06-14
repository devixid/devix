import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  assertLemonSqueezyEnv,
  isLemonSqueezyConfigured,
  verifyLemonSignature,
  configureLemonSqueezy,
  getLemonStoreId,
  getLemonWebhookSecret,
} from "@/lib/lemonsqueezy";

// Mock @lemonsqueezy/lemonsqueezy.js to inspect onError callbacks
const mockLemonSqueezySetup = vi.fn();
vi.mock("@lemonsqueezy/lemonsqueezy.js", () => {
  return {
    lemonSqueezySetup: (config: any) => {
      mockLemonSqueezySetup(config);
      // Trigger onError if needed to cover that block
      if (config && config.onError) {
        config.onError(new Error("Test setup error"));
      }
    },
  };
});

const SECRET = "test-lemon-secret";

function signBody(body: string, secret = SECRET): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

describe("configureLemonSqueezy", () => {
  afterEach(() => {
    delete process.env.LEMONSQUEEZY_API_KEY;
    vi.restoreAllMocks();
  });

  it("throws when LEMONSQUEEZY_API_KEY is not configured", () => {
    delete process.env.LEMONSQUEEZY_API_KEY;
    expect(() => configureLemonSqueezy()).toThrow("LEMONSQUEEZY_API_KEY is not configured.");
  });

  it("configures the Lemon Squeezy SDK when api key is provided", () => {
    process.env.LEMONSQUEEZY_API_KEY = "test_api_key";
    
    // Spy on console.error to avoid test pollution when onError is triggered
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => configureLemonSqueezy()).not.toThrow();
    expect(mockLemonSqueezySetup).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "test_api_key",
        onError: expect.any(Function),
      })
    );
    expect(consoleSpy).toHaveBeenCalledWith("[Lemon Squeezy]", expect.any(Error));
  });

  it("does not re-configure when configureLemonSqueezy is called again", async () => {
    vi.resetModules();
    const { configureLemonSqueezy: configureFresh } = await import("@/lib/lemonsqueezy");

    process.env.LEMONSQUEEZY_API_KEY = "test_api_key";
    mockLemonSqueezySetup.mockClear();

    // Call it twice on a fresh module instance
    configureFresh();
    configureFresh();

    expect(mockLemonSqueezySetup).toHaveBeenCalledTimes(1);
  });
});

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

describe("getLemonStoreId", () => {
  afterEach(() => {
    delete process.env.LEMONSQUEEZY_STORE_ID;
  });

  it("throws when store id is missing", () => {
    delete process.env.LEMONSQUEEZY_STORE_ID;
    expect(() => getLemonStoreId()).toThrow("LEMONSQUEEZY_STORE_ID is not configured.");
  });

  it("returns store id when present", () => {
    process.env.LEMONSQUEEZY_STORE_ID = "999";
    expect(getLemonStoreId()).toBe("999");
  });
});

describe("getLemonWebhookSecret", () => {
  afterEach(() => {
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  });

  it("throws when webhook secret is missing", () => {
    delete process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
    expect(() => getLemonWebhookSecret()).toThrow("LEMONSQUEEZY_WEBHOOK_SECRET is not configured.");
  });

  it("returns secret when present", () => {
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = "webhook_secret_xyz";
    expect(getLemonWebhookSecret()).toBe("webhook_secret_xyz");
  });
});

describe("verifyLemonSignature", () => {
  it("validates HMAC signatures", () => {
    const body = '{"meta":{"event_name":"order_created"}}';
    expect(verifyLemonSignature(body, signBody(body), SECRET)).toBe(true);
    expect(verifyLemonSignature(body, "bad-signature", SECRET)).toBe(false);
  });

  it("returns false if signature buffer length is different from digest length", () => {
    const body = '{"meta":{"event_name":"order_created"}}';
    // Short signature
    expect(verifyLemonSignature(body, "short", SECRET)).toBe(false);
    // Empty signature
    expect(verifyLemonSignature(body, "", SECRET)).toBe(false);
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
