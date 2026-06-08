import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  isTurnstileClientEnabled,
  isTurnstileEnabled,
  TURNSTILE_SITE_KEY,
  verifyTurnstile,
} from "@/lib/turnstile";

describe("isTurnstileEnabled", () => {
  it("reflects server secret configuration", () => {
    const previous = process.env.TURNSTILE_SECRET_KEY;
    delete process.env.TURNSTILE_SECRET_KEY;
    expect(isTurnstileEnabled()).toBe(false);
    process.env.TURNSTILE_SECRET_KEY = "secret";
    expect(isTurnstileEnabled()).toBe(true);
    process.env.TURNSTILE_SECRET_KEY = previous;
  });
});

describe("isTurnstileClientEnabled", () => {
  it("reads the module-level site key constant", () => {
    expect(typeof TURNSTILE_SITE_KEY).toBe("string");
    expect(isTurnstileClientEnabled()).toBe(Boolean(TURNSTILE_SITE_KEY));
  });
});

describe("verifyTurnstile", () => {
  beforeEach(() => {
    process.env.TURNSTILE_SECRET_KEY = "test-turnstile-secret";
  });

  afterEach(() => {
    delete process.env.TURNSTILE_SECRET_KEY;
    vi.unstubAllGlobals();
  });

  it("no-ops when Turnstile is disabled", async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    await expect(verifyTurnstile(null)).resolves.toBe(true);
  });

  it("rejects missing tokens when enabled", async () => {
    await expect(verifyTurnstile(undefined)).resolves.toBe(false);
  });

  it("returns Cloudflare verification result", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({ success: true }),
      }),
    );

    await expect(verifyTurnstile("token", "127.0.0.1")).resolves.toBe(true);
  });
});
