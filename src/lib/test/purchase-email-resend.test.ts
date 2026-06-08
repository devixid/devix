import { describe, expect, it } from "vitest";
import { maskEmail } from "@/lib/purchase-email-resend";

describe("maskEmail", () => {
  it("masks the local part while keeping the domain", () => {
    expect(maskEmail("jane.doe@example.com")).toBe("j***e@example.com");
  });

  it("handles short local parts", () => {
    expect(maskEmail("ab@example.com")).toBe("a*@example.com");
  });

  it("returns a generic label for invalid input", () => {
    expect(maskEmail("@invalid")).toBe("your email");
  });
});
