import { beforeEach, describe, expect, it, vi } from "vitest";

// ── Dependency Mocks ───────────────────────────────────────────────────────────
let mockRedisClient: any = null;

vi.mock("@/lib/redis", () => ({
  getRedisClient: vi.fn(() => mockRedisClient),
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn();
    static fixedWindow = vi.fn();
    constructor() {}
  },
}));

// Import AFTER mocks
import {
  getClientIp,
  getGlobalLimiter,
  getAuthLimiter,
  getRegisterLimiter,
  getContactLimiter,
  getFeedbackLimiter,
  getApiLimiter,
  getPurchaseLimiter,
  getPurchaseEmailLimiter,
  getPurchaseEmailResendLimiter,
  getDownloadLimiter,
} from "@/lib/rate-limit";

function headersFrom(record: Record<string, string>): Headers {
  return new Headers(record);
}

describe("getClientIp", () => {
  it("prefers x-vercel-forwarded-for when valid", () => {
    const ip = getClientIp(headersFrom({ "x-vercel-forwarded-for": "203.0.113.10" }));
    expect(ip).toBe("203.0.113.10");
  });

  it("uses first x-forwarded-for entry", () => {
    const ip = getClientIp(
      headersFrom({ "x-forwarded-for": "198.51.100.2, 10.0.0.1" }),
    );
    expect(ip).toBe("198.51.100.2");
  });

  it("prefers x-real-ip when others are missing", () => {
    const ip = getClientIp(headersFrom({ "x-real-ip": "198.51.100.99" }));
    expect(ip).toBe("198.51.100.99");
  });

  it("falls back to localhost when headers are missing", () => {
    expect(getClientIp(new Headers())).toBe("127.0.0.1");
  });

  it("falls back to localhost if header IP is invalid", () => {
    expect(getClientIp(headersFrom({ "x-real-ip": "not-an-ip" }))).toBe("127.0.0.1");
  });
});

describe("Limiters", () => {
  beforeEach(() => {
    mockRedisClient = null;
  });

  const limiters = [
    { name: "getGlobalLimiter", fn: getGlobalLimiter },
    { name: "getAuthLimiter", fn: getAuthLimiter },
    { name: "getRegisterLimiter", fn: getRegisterLimiter },
    { name: "getContactLimiter", fn: getContactLimiter },
    { name: "getFeedbackLimiter", fn: getFeedbackLimiter },
    { name: "getApiLimiter", fn: getApiLimiter },
    { name: "getPurchaseLimiter", fn: getPurchaseLimiter },
    { name: "getPurchaseEmailLimiter", fn: getPurchaseEmailLimiter },
    { name: "getPurchaseEmailResendLimiter", fn: getPurchaseEmailResendLimiter },
    { name: "getDownloadLimiter", fn: getDownloadLimiter },
  ];

  for (const { name, fn } of limiters) {
    describe(name, () => {
      it("returns null when Redis client is not available", () => {
        mockRedisClient = null;
        expect(fn()).toBeNull();
      });

      it("returns a Limiter instance and caches it when Redis is configured", () => {
        mockRedisClient = { fakeRedis: true };
        const first = fn();
        expect(first).not.toBeNull();
        expect(fn()).toBe(first); // returns same cached instance
      });
    });
  }
});
