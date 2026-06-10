import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  mockAllowedOrigin,
  resetNextHeadersMock,
} from "@/lib/test/mocks/next-headers";
import { getTestMocks } from "@/lib/test/mocks/registry";

vi.mock("next/headers", async () => {
  const { createNextHeadersMock } =
    await import("@/lib/test/mocks/next-headers");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const nextHeadersMock = createNextHeadersMock();
  getTestMocks().nextHeaders = nextHeadersMock;
  return {
    headers: nextHeadersMock.headers,
    cookies: nextHeadersMock.cookies,
  };
});

import { verifyCsrfOrigin } from "@/lib/auth";

describe("mock kit / next-headers", () => {
  beforeEach(() => {
    resetNextHeadersMock(getTestMocks().nextHeaders!);
    process.env.NEXT_PUBLIC_SITE_URL = "https://devix.test";
  });

  it("allows requests from configured site origin", async () => {
    mockAllowedOrigin(getTestMocks().nextHeaders!, "https://devix.test", "devix.test");
    await expect(verifyCsrfOrigin()).resolves.toBeUndefined();
  });

  it("rejects requests from unknown origins", async () => {
    mockAllowedOrigin(getTestMocks().nextHeaders!, "https://evil.example", "devix.test");
    await expect(verifyCsrfOrigin()).rejects.toThrow(/Invalid request origin/);
  });
});
