import { describe, expect, it } from "vitest";
import {
  ChangePasswordSchema,
  ContactFormSchema,
  LoginSchema,
  ProductSchema,
  PurchaseSchema,
} from "@/lib/schemas";

describe("ContactFormSchema", () => {
  it("accepts valid contact payloads", () => {
    const parsed = ContactFormSchema.parse({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "Hello, I would like to discuss a project.",
    });
    expect(parsed.email).toBe("jane@example.com");
  });

  it("rejects short messages", () => {
    const result = ContactFormSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      message: "Hi",
    });
    expect(result.success).toBe(false);
  });
});

describe("LoginSchema", () => {
  it("requires password", () => {
    expect(LoginSchema.safeParse({ email: "admin@example.com" }).success).toBe(
      false,
    );
  });
});

describe("ChangePasswordSchema", () => {
  it("enforces password complexity and confirmation", () => {
    const valid = ChangePasswordSchema.safeParse({
      currentPassword: "OldPassword1!",
      newPassword: "NewPassword1!",
      confirmPassword: "NewPassword1!",
    });
    expect(valid.success).toBe(true);

    const mismatch = ChangePasswordSchema.safeParse({
      currentPassword: "OldPassword1!",
      newPassword: "NewPassword1!",
      confirmPassword: "Different1!",
    });
    expect(mismatch.success).toBe(false);
  });
});

describe("PurchaseSchema", () => {
  it("requires a cuid product id", () => {
    const result = PurchaseSchema.safeParse({
      productId: "not-a-cuid",
      buyerName: "Buyer",
      buyerEmail: "buyer@example.com",
    });
    expect(result.success).toBe(false);
  });
});

describe("ProductSchema", () => {
  it("normalizes currency to lowercase", () => {
    const parsed = ProductSchema.parse({
      name: "Starter Kit",
      slug: "starter-kit",
      description: "A downloadable starter kit for new projects.",
      price: 29,
      currency: "USD",
    });
    expect(parsed.currency).toBe("usd");
  });
});
