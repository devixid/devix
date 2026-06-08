import { describe, expect, it } from "vitest";
import { getClientIp } from "@/lib/rate-limit";

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

  it("falls back to localhost when headers are missing", () => {
    expect(getClientIp(new Headers())).toBe("127.0.0.1");
  });
});
