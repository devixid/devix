import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAllowedOrigin,
  resetNextHeadersMock,
} from "@/lib/test/mocks/next-headers";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { getTestMocks } from "@/lib/test/mocks/registry";

// ── External mocks ─────────────────────────────────────────────────────────────

vi.mock("next/headers", async () => {
  const { createNextHeadersMock } = await import(
    "@/lib/test/mocks/next-headers"
  );
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const nextHeadersMock = createNextHeadersMock();
  getTestMocks().nextHeaders = nextHeadersMock;
  return {
    headers: nextHeadersMock.headers,
    cookies: nextHeadersMock.cookies,
  };
});

vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

vi.mock("@/lib/redis", () => ({
  cachedQuery: vi.fn(async (_key: string, fetcher: () => unknown) =>
    fetcher(),
  ),
  invalidateCache: vi.fn(),
  getRedisClient: vi.fn(() => null),
}));

import {
  decryptSession,
  encryptSession,
  verifyAdminSession,
  verifyCsrfOrigin,
} from "@/lib/auth";
import { createSessionToken } from "@/lib/session-token";
import "@/lib/prisma";

// ── encryptSession / decryptSession ────────────────────────────────────────────

describe("encryptSession / decryptSession", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret-for-auth";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it("encrypts and decrypts a session round-trip", async () => {
    const token = await encryptSession({
      userId: "user_1",
      email: "admin@devix.test",
    });

    const payload = await decryptSession(token);

    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe("user_1");
    expect(payload?.email).toBe("admin@devix.test");
  });

  it("returns null for an invalid token", async () => {
    const result = await decryptSession("invalid.jwt.token");
    expect(result).toBeNull();
  });

  it("returns null for an empty string", async () => {
    const result = await decryptSession("");
    expect(result).toBeNull();
  });
});

// ── verifyCsrfOrigin ───────────────────────────────────────────────────────────

describe("verifyCsrfOrigin", () => {
  beforeEach(() => {
    resetNextHeadersMock(getTestMocks().nextHeaders!);
    process.env.NEXT_PUBLIC_SITE_URL = "https://devix.test";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("does not throw when origin header is absent", async () => {
    // No origin header — default mock returns empty headers
    await expect(verifyCsrfOrigin()).resolves.toBeUndefined();
  });

  it("allows requests from configured NEXT_PUBLIC_SITE_URL", async () => {
    mockAllowedOrigin(getTestMocks().nextHeaders!, "https://devix.test");
    await expect(verifyCsrfOrigin()).resolves.toBeUndefined();
  });

  it("allows requests from the host header (http)", async () => {
    getTestMocks().nextHeaders!.setRequestHeaders({
      origin: "http://localhost:3000",
      host: "localhost:3000",
    });
    await expect(verifyCsrfOrigin()).resolves.toBeUndefined();
  });

  it("allows requests from the host header (https)", async () => {
    getTestMocks().nextHeaders!.setRequestHeaders({
      origin: "https://devix.id",
      host: "devix.id",
    });
    await expect(verifyCsrfOrigin()).resolves.toBeUndefined();
  });

  it("rejects requests from unknown origins", async () => {
    mockAllowedOrigin(
      getTestMocks().nextHeaders!,
      "https://evil.example.com",
      "devix.test",
    );

    await expect(verifyCsrfOrigin()).rejects.toThrow(/Invalid request origin/);
  });

  it("rejects even when env is not set and origin does not match host", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    getTestMocks().nextHeaders!.setRequestHeaders({
      origin: "https://attacker.com",
      host: "devix.test",
    });

    await expect(verifyCsrfOrigin()).rejects.toThrow(/Invalid request origin/);
  });
});

// ── verifyAdminSession ─────────────────────────────────────────────────────────

describe("verifyAdminSession", () => {
  beforeEach(() => {
    resetNextHeadersMock(getTestMocks().nextHeaders!);
    resetMockPrisma(getTestMocks().prisma!);
    process.env.JWT_SECRET = "test-jwt-secret-for-auth";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  it("throws when no session cookie is present", async () => {
    // Cookie store is empty by default
    await expect(verifyAdminSession()).rejects.toThrow(/Unauthorized/);
  });

  it("throws when session cookie is present but invalid (corrupt token)", async () => {
    getTestMocks().nextHeaders!.setCookie("devix_session", "bad-token");

    await expect(verifyAdminSession()).rejects.toThrow(/Unauthorized/);
  });

  it("throws when user is not found in the DB (whitelist check fails)", async () => {
    // Create a valid session token and set it
    const token = await createSessionToken({
      userId: "usr_1",
      email: "admin@devix.test",
    });
    getTestMocks().nextHeaders!.setCookie("devix_session", token);

    // DB lookup returns null — user not whitelisted
    getTestMocks().prisma!.user.findUnique.mockResolvedValue(null);

    await expect(verifyAdminSession()).rejects.toThrow(/whitelist/);
  });

  it("returns session when cookie is valid and user exists in DB", async () => {
    const token = await createSessionToken({
      userId: "usr_2",
      email: "admin@devix.test",
    });
    getTestMocks().nextHeaders!.setCookie("devix_session", token);

    getTestMocks().prisma!.user.findUnique.mockResolvedValue({
      email: "admin@devix.test",
    });

    const session = await verifyAdminSession();
    expect(session.email).toBe("admin@devix.test");
    expect(session.userId).toBe("usr_2");
  });
});
