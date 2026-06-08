import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  SESSION_COOKIE_DEV,
  SESSION_COOKIE_PROD,
  createSessionToken,
  isSecureRequestFromHeaders,
  isSecureRequestUrl,
  readSessionTokenFromCookies,
  resolveSessionCookieName,
  verifySessionToken,
} from "@/lib/session-token";

describe("resolveSessionCookieName", () => {
  it("uses __Host- cookie on HTTPS contexts", () => {
    expect(resolveSessionCookieName(true)).toBe(SESSION_COOKIE_PROD);
    expect(resolveSessionCookieName(false)).toBe(SESSION_COOKIE_DEV);
  });
});

describe("isSecureRequestFromHeaders / isSecureRequestUrl", () => {
  it("detects HTTPS from forwarded proto", () => {
    expect(
      isSecureRequestFromHeaders(new Headers({ "x-forwarded-proto": "https" })),
    ).toBe(true);
    expect(isSecureRequestUrl("https:")).toBe(true);
    expect(isSecureRequestUrl("http:")).toBe(false);
  });
});

describe("readSessionTokenFromCookies", () => {
  it("reads primary and legacy cookie names", () => {
    const cookies = {
      get: (name: string) =>
        name === SESSION_COOKIE_DEV ? { value: "token-dev" } : undefined,
    };
    expect(readSessionTokenFromCookies(cookies, false)).toBe("token-dev");
  });
});

describe("session token crypto", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "unit-test-jwt-secret";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it("encrypts and decrypts session payloads", async () => {
    const token = await createSessionToken({
      userId: "user_1",
      email: "admin@example.com",
    });
    const payload = await verifySessionToken(token);
    expect(payload.userId).toBe("user_1");
    expect(payload.email).toBe("admin@example.com");
  });
});
