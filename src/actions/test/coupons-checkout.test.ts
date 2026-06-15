import { describe, expect, it, vi, beforeEach } from "vitest";
import { getTestMocks } from "@/lib/test/mocks/registry";
import { Decimal } from "@/lib/money";

// Mock Prisma
vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

// Mock Next.js Headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({
    get: (key: string) => (key === "user-agent" ? "vitest" : "127.0.0.1"),
  }),
}));

// Mock Turnstile
vi.mock("@/lib/turnstile", () => ({
  verifyTurnstile: vi.fn().mockResolvedValue(true),
  isTurnstileClientEnabled: vi.fn().mockReturnValue(false),
}));

// Mock Rate Limiter
vi.mock("@/lib/rate-limit", () => ({
  getPurchaseLimiter: vi.fn().mockReturnValue(null),
  getPurchaseEmailLimiter: vi.fn().mockReturnValue(null),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

// Mock Payment provider
vi.mock("@/lib/payment", () => {
  const mockCreateCheckout = vi.fn().mockResolvedValue({
    mode: "redirect",
    url: "https://stripe.com/checkout",
  });
  (globalThis as any).__mockCreateCheckout = mockCreateCheckout;
  return {
    getPaymentProvider: vi.fn().mockResolvedValue({
      createCheckout: mockCreateCheckout,
    }),
    resolvePaymentProviderId: vi.fn().mockResolvedValue("stripe"),
    isPaymentProviderConfigured: vi.fn().mockReturnValue(true),
  };
});

import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { validateCouponAction, submitPurchase } from "@/actions/purchase";
import { buildProduct } from "@/lib/test/mocks/fixtures/purchase";

describe("checkout and coupon validation", () => {
  beforeEach(() => {
    resetMockPrisma(getTestMocks().prisma!);
    vi.clearAllMocks();
  });

  describe("validateCouponAction", () => {
    it("returns coupon info if valid", async () => {
      const mockCoupon = {
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: new Decimal(20),
        active: true,
        maxUses: 100,
        useCount: 10,
        expiresAt: null,
      };
      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce(mockCoupon);

      const result = await validateCouponAction("save20");
      expect(result.success).toBe(true);
      expect(result.discountType).toBe("PERCENTAGE");
      expect(result.discountValue).toBe(20);
    });

    it("returns error if coupon is inactive", async () => {
      const mockCoupon = {
        code: "INACTIVE",
        discountType: "PERCENTAGE",
        discountValue: new Decimal(10),
        active: false,
        maxUses: null,
        useCount: 0,
        expiresAt: null,
      };
      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce(mockCoupon);

      const result = await validateCouponAction("INACTIVE");
      expect(result.success).toBe(false);
      expect(result.message).toBe("Invalid or inactive coupon code.");
    });

    it("returns error if coupon has expired", async () => {
      const mockCoupon = {
        code: "EXPIRED",
        discountType: "PERCENTAGE",
        discountValue: new Decimal(10),
        active: true,
        maxUses: null,
        useCount: 0,
        expiresAt: new Date("2020-01-01"),
      };
      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce(mockCoupon);

      const result = await validateCouponAction("EXPIRED");
      expect(result.success).toBe(false);
      expect(result.message).toBe("This coupon code has expired.");
    });

    it("returns error if coupon reached max uses limit", async () => {
      const mockCoupon = {
        code: "MAXED",
        discountType: "PERCENTAGE",
        discountValue: new Decimal(10),
        active: true,
        maxUses: 5,
        useCount: 5,
        expiresAt: null,
      };
      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce(mockCoupon);

      const result = await validateCouponAction("MAXED");
      expect(result.success).toBe(false);
      expect(result.message).toBe("This coupon code has reached its maximum usage limit.");
    });
  });

  describe("submitPurchase with discount rules", () => {
    it("applies 10% bundling discount for 2 items", async () => {
      const product1 = buildProduct({ id: "cju878abc000001l9f1a23xy1", price: new Decimal(10.0), priceMinor: new Decimal(1000) });
      const product2 = buildProduct({ id: "cju878abc000001l9f1a23xy2", price: new Decimal(20.0), priceMinor: new Decimal(2000) });

      // Mock findMany to return both products
      getTestMocks().prisma!.product.findMany.mockResolvedValueOnce([product1, product2]);

      const formData = new FormData();
      formData.append("productIds", "cju878abc000001l9f1a23xy1");
      formData.append("productIds", "cju878abc000001l9f1a23xy2");
      formData.append("buyerName", "Test Buyer");
      formData.append("buyerEmail", "buyer@example.com");
      formData.append("turnstileToken", "token");

      const result = await submitPurchase({ success: false }, formData);

      expect(result.success).toBe(true);
      expect(result.checkoutUrl).toBe("https://stripe.com/checkout");

      // Verify final amount: (1000 + 2000) * 0.90 = 2700
      const paymentProvider = await import("@/lib/payment");
      const activeProvider = await paymentProvider.getPaymentProvider();
      const checkoutCall = vi.mocked(activeProvider.createCheckout).mock.calls[0][0];
      expect(checkoutCall.amountMinor.toString()).toBe("2700");
    });

    it("applies 15% bundling discount for 3 items", async () => {
      const product1 = buildProduct({ id: "cju878abc000001l9f1a23xy1", price: new Decimal(10.0), priceMinor: new Decimal(1000) });
      const product2 = buildProduct({ id: "cju878abc000001l9f1a23xy2", price: new Decimal(20.0), priceMinor: new Decimal(2000) });
      const product3 = buildProduct({ id: "cju878abc000001l9f1a23xy3", price: new Decimal(30.0), priceMinor: new Decimal(3000) });

      getTestMocks().prisma!.product.findMany.mockResolvedValueOnce([product1, product2, product3]);

      const formData = new FormData();
      formData.append("productIds", "cju878abc000001l9f1a23xy1");
      formData.append("productIds", "cju878abc000001l9f1a23xy2");
      formData.append("productIds", "cju878abc000001l9f1a23xy3");
      formData.append("buyerName", "Test Buyer");
      formData.append("buyerEmail", "buyer@example.com");
      formData.append("turnstileToken", "token");

      const result = await submitPurchase({ success: false }, formData);

      expect(result.success).toBe(true);

      // Verify final amount: (1000 + 2000 + 3000) * 0.85 = 5100
      const paymentProvider = await import("@/lib/payment");
      const activeProvider = await paymentProvider.getPaymentProvider();
      const checkoutCall = vi.mocked(activeProvider.createCheckout).mock.calls[0][0];
      expect(checkoutCall.amountMinor.toString()).toBe("5100");
    });

    it("applies percentage coupon code on top of bundle discount", async () => {
      const product1 = buildProduct({ id: "cju878abc000001l9f1a23xy1", price: new Decimal(10.0), priceMinor: new Decimal(1000) });
      const product2 = buildProduct({ id: "cju878abc000001l9f1a23xy2", price: new Decimal(20.0), priceMinor: new Decimal(2000) });

      getTestMocks().prisma!.product.findMany.mockResolvedValueOnce([product1, product2]);

      const mockCoupon = {
        code: "SAVE20",
        discountType: "PERCENTAGE",
        discountValue: new Decimal(20),
        active: true,
        maxUses: null,
        useCount: 0,
        expiresAt: null,
      };
      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce(mockCoupon);

      const formData = new FormData();
      formData.append("productIds", "cju878abc000001l9f1a23xy1");
      formData.append("productIds", "cju878abc000001l9f1a23xy2");
      formData.append("couponCode", "SAVE20");
      formData.append("buyerName", "Test Buyer");
      formData.append("buyerEmail", "buyer@example.com");
      formData.append("turnstileToken", "token");

      const result = await submitPurchase({ success: false }, formData);

      expect(result.success).toBe(true);

      // Verify final amount: (1000 + 2000) * 0.90 = 2700 after bundling.
      // After 20% coupon discount: 2700 * 0.80 = 2160.
      const paymentProvider = await import("@/lib/payment");
      const activeProvider = await paymentProvider.getPaymentProvider();
      const checkoutCall = vi.mocked(activeProvider.createCheckout).mock.calls[0][0];
      expect(checkoutCall.amountMinor.toString()).toBe("2160");
    });

    it("applies fixed coupon code on top of bundle discount", async () => {
      const product1 = buildProduct({ id: "cju878abc000001l9f1a23xy1", price: new Decimal(10.0), priceMinor: new Decimal(1000) });
      const product2 = buildProduct({ id: "cju878abc000001l9f1a23xy2", price: new Decimal(20.0), priceMinor: new Decimal(2000) });

      getTestMocks().prisma!.product.findMany.mockResolvedValueOnce([product1, product2]);

      const mockCoupon = {
        code: "SAVE5",
        discountType: "FIXED",
        discountValue: new Decimal(5.00), // $5.00 = 500 minor units
        active: true,
        maxUses: null,
        useCount: 0,
        expiresAt: null,
      };
      getTestMocks().prisma!.coupon.findUnique.mockResolvedValueOnce(mockCoupon);

      const formData = new FormData();
      formData.append("productIds", "cju878abc000001l9f1a23xy1");
      formData.append("productIds", "cju878abc000001l9f1a23xy2");
      formData.append("couponCode", "SAVE5");
      formData.append("buyerName", "Test Buyer");
      formData.append("buyerEmail", "buyer@example.com");
      formData.append("turnstileToken", "token");

      const result = await submitPurchase({ success: false }, formData);

      expect(result.success).toBe(true);

      // Verify final amount: (1000 + 2000) * 0.90 = 2700 after bundling.
      // After fixed $5.00 coupon discount: 2700 - 500 = 2200.
      const paymentProvider = await import("@/lib/payment");
      const activeProvider = await paymentProvider.getPaymentProvider();
      const checkoutCall = vi.mocked(activeProvider.createCheckout).mock.calls[0][0];
      expect(checkoutCall.amountMinor.toString()).toBe("2200");
    });

    it("rejects multi-product bundles for Lemon Squeezy", async () => {
      // Mock Lemon Squeezy active provider
      const paymentProvider = await import("@/lib/payment");
      vi.mocked(paymentProvider.resolvePaymentProviderId).mockResolvedValueOnce("lemonsqueezy");

      const product1 = buildProduct({ id: "cju878abc000001l9f1a23xy1", price: new Decimal(10.0), priceMinor: new Decimal(1000) });
      const product2 = buildProduct({ id: "cju878abc000001l9f1a23xy2", price: new Decimal(20.0), priceMinor: new Decimal(2000) });

      getTestMocks().prisma!.product.findMany.mockResolvedValueOnce([product1, product2]);

      const formData = new FormData();
      formData.append("productIds", "cju878abc000001l9f1a23xy1");
      formData.append("productIds", "cju878abc000001l9f1a23xy2");
      formData.append("buyerName", "Test Buyer");
      formData.append("buyerEmail", "buyer@example.com");
      formData.append("turnstileToken", "token");

      const result = await submitPurchase({ success: false }, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe("Lemon Squeezy only supports purchasing one item at a time.");
    });
  });
});
