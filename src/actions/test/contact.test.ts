import { describe, expect, it } from "vitest";
import { ContactFormSchema } from "@/lib/schemas";

/**
 * Server actions delegate validation to shared Zod schemas.
 * These tests cover the input contract used by submitContactForm.
 */
describe("submitContactForm input contract", () => {
  it("rejects invalid email before persistence", () => {
    const result = ContactFormSchema.safeParse({
      name: "Jane Doe",
      email: "not-valid",
      message: "This is a long enough message for contact.",
    });
    expect(result.success).toBe(false);
  });

  it("accepts trimmed-ready valid payloads", () => {
    const result = ContactFormSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "I would like to discuss a new website project.",
    });
    expect(result.success).toBe(true);
  });
});
