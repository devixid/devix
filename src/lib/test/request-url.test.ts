import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getRequestBaseUrl } from "@/lib/request-url";

describe("getRequestBaseUrl", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://fallback.example";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  it("builds URL from forwarded host and proto", () => {
    const headers = new Headers({
      "x-forwarded-host": "preview.example",
      "x-forwarded-proto": "https",
    });
    expect(getRequestBaseUrl(headers)).toBe("https://preview.example");
  });

  it("uses http for localhost", () => {
    const headers = new Headers({ host: "localhost:3000" });
    expect(getRequestBaseUrl(headers)).toBe("http://localhost:3000");
  });

  it("falls back to NEXT_PUBLIC_SITE_URL when host is missing", () => {
    expect(getRequestBaseUrl(new Headers())).toBe("https://fallback.example");
  });
});
