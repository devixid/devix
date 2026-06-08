import { describe, expect, it } from "vitest";
import { generateDownloadToken } from "@/lib/tokens";

describe("generateDownloadToken", () => {
  it("returns URL-safe base64 strings", () => {
    const token = generateDownloadToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(token.length).toBeGreaterThanOrEqual(40);
  });

  it("generates unique values", () => {
    const a = generateDownloadToken();
    const b = generateDownloadToken();
    expect(a).not.toBe(b);
  });
});
