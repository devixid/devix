import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { getTestMocks } from "@/lib/test/mocks/registry";

// ── Prisma mock ────
vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

import "@/lib/prisma"; // initialize mock registry

// ── Other dependencies mocks ────
vi.mock("@/lib/stripe", () => {
  const isStripeConfigured = vi.fn();
  const retrieve = vi.fn();
  const getStripe = vi.fn(() => ({
    checkout: {
      sessions: {
        retrieve,
      },
    },
  }));
  (globalThis as any).__stripeMocks = { isStripeConfigured, retrieve };
  return { isStripeConfigured, getStripe };
});

vi.mock("@/lib/purchase-fulfillment", () => {
  const fulfillProductPurchase = vi.fn();
  (globalThis as any).__fulfillProductPurchaseMock = fulfillProductPurchase;
  return { fulfillProductPurchase };
});

vi.mock("@/lib/rotate-purchase-download-token", () => {
  const rotatePurchaseDownloadToken = vi.fn();
  (globalThis as any).__rotatePurchaseDownloadTokenMock = rotatePurchaseDownloadToken;
  return { rotatePurchaseDownloadToken };
});

vi.mock("@/lib/email", () => {
  const sendPurchaseConfirmation = vi.fn();
  (globalThis as any).__sendPurchaseConfirmationMock = sendPurchaseConfirmation;
  return { sendPurchaseConfirmation };
});

let mockIsStripeConfigured: any;
let mockRetrieve: any;
let mockFulfillProductPurchase: any;
let mockRotatePurchaseDownloadToken: any;
let mockSendPurchaseConfirmation: any;

import { resendPurchaseEmailByStripeSession, maskEmail } from "@/lib/purchase-email-resend";

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

describe("resendPurchaseEmailByStripeSession", () => {
  beforeEach(() => {
    mockIsStripeConfigured = (globalThis as any).__stripeMocks.isStripeConfigured;
    mockRetrieve = (globalThis as any).__stripeMocks.retrieve;
    mockFulfillProductPurchase = (globalThis as any).__fulfillProductPurchaseMock;
    mockRotatePurchaseDownloadToken = (globalThis as any).__rotatePurchaseDownloadTokenMock;
    mockSendPurchaseConfirmation = (globalThis as any).__sendPurchaseConfirmationMock;

    resetMockPrisma(getTestMocks().prisma!);
    mockRetrieve.mockClear();
    mockIsStripeConfigured.mockClear();
    mockFulfillProductPurchase.mockClear();
    mockRotatePurchaseDownloadToken.mockClear();
    mockSendPurchaseConfirmation.mockClear();
    mockIsStripeConfigured.mockReturnValue(true);
  });

  it("returns error if session id is invalid", async () => {
    const result = await resendPurchaseEmailByStripeSession("invalid_id", "https://site.com");
    expect(result).toEqual({ ok: false, error: "Invalid checkout reference." });
  });

  it("returns error if Stripe is not configured", async () => {
    mockIsStripeConfigured.mockReturnValue(false);
    const result = await resendPurchaseEmailByStripeSession("cs_test_123", "https://site.com");
    expect(result).toEqual({ ok: false, error: "Payments are not configured." });
  });

  it("returns error if Stripe checkout session retrieval fails", async () => {
    mockRetrieve.mockRejectedValueOnce(new Error("Stripe API down"));
    const result = await resendPurchaseEmailByStripeSession("cs_test_123", "https://site.com");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Could not verify your payment");
    }
  });

  it("returns error if payment is not completed yet", async () => {
    mockRetrieve.mockResolvedValueOnce({
      payment_status: "unpaid",
    });
    const result = await resendPurchaseEmailByStripeSession("cs_test_123", "https://site.com");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Payment is not completed yet");
    }
  });

  it("returns error if metadata is incomplete", async () => {
    mockRetrieve.mockResolvedValueOnce({
      payment_status: "paid",
      metadata: {},
    });
    const result = await resendPurchaseEmailByStripeSession("cs_test_123", "https://site.com");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Could not resolve your order");
    }
  });

  it("fulfills and returns success if purchase row does not exist", async () => {
    mockRetrieve.mockResolvedValueOnce({
      id: "cs_test_123",
      payment_status: "paid",
      amount_total: 1000,
      currency: "usd",
      payment_intent: "pi_123",
      metadata: {
        productId: "prod_1",
        buyerName: "John Doe",
        buyerEmail: "john@example.com",
        buyerIp: "127.0.0.1",
        userAgent: "browser",
      },
    });

    getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(null);
    mockFulfillProductPurchase.mockResolvedValueOnce({
      buyerEmail: "john@example.com",
    });

    const result = await resendPurchaseEmailByStripeSession("cs_test_123", "https://site.com");
    expect(result).toEqual({
      ok: true,
      message: "Download link sent to j**n@example.com.",
    });
    expect(mockFulfillProductPurchase).toHaveBeenCalledWith({
      productId: "prod_1",
      buyerName: "John Doe",
      buyerEmail: "john@example.com",
      stripeSessionId: "cs_test_123",
      stripePaymentIntentId: "pi_123",
      amountMinor: expect.any(Object),
      currency: "usd",
      buyerIp: "127.0.0.1",
      userAgent: "browser",
      siteUrl: "https://site.com",
    });
  });

  it("returns error if fulfillment fails", async () => {
    mockRetrieve.mockResolvedValueOnce({
      id: "cs_test_123",
      payment_status: "paid",
      metadata: {
        productId: "prod_1",
        buyerName: "John Doe",
        buyerEmail: "john@example.com",
      },
    });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(null);
    mockFulfillProductPurchase.mockRejectedValueOnce(new Error("DB failure"));

    const result = await resendPurchaseEmailByStripeSession("cs_test_123", "https://site.com");
    expect(result).toEqual({
      ok: false,
      error: "Could not send the email right now. Please try again shortly.",
    });
  });

  it("returns error if purchase is revoked", async () => {
    mockRetrieve.mockResolvedValueOnce({
      payment_status: "paid",
      metadata: {
        productId: "prod_1",
        buyerName: "John Doe",
        buyerEmail: "john@example.com",
      },
    });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce({
      id: "pur_1",
      buyerEmail: "john@example.com",
      revokedAt: new Date(),
    });

    const result = await resendPurchaseEmailByStripeSession("cs_test_123", "https://site.com");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("no longer active");
    }
  });

  it("rotates token, sends email, updates sent time, and returns success if purchase exists", async () => {
    mockRetrieve.mockResolvedValueOnce({
      payment_status: "paid",
      metadata: {
        productId: "prod_1",
        buyerName: "John Doe",
        buyerEmail: "john@example.com",
      },
    });

    const mockPurchase = {
      id: "pur_1",
      buyerName: "John Doe",
      buyerEmail: "john@example.com",
      revokedAt: null,
      product: { name: "Pro Kit" },
    };
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(mockPurchase);

    const rotatedPurchase = {
      ...mockPurchase,
      downloadToken: "rotated_token_123",
    };
    mockRotatePurchaseDownloadToken.mockResolvedValueOnce(rotatedPurchase);
    mockSendPurchaseConfirmation.mockResolvedValueOnce({ data: {} });
    getTestMocks().prisma!.purchase.update.mockResolvedValueOnce({});

    const result = await resendPurchaseEmailByStripeSession("cs_test_123", "https://site.com");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.message).toContain("New download link sent to j**n@example.com");
    }
    expect(mockRotatePurchaseDownloadToken).toHaveBeenCalledWith("pur_1");
    expect(mockSendPurchaseConfirmation).toHaveBeenCalledWith({
      name: "John Doe",
      email: "john@example.com",
      productName: "Pro Kit",
      downloadToken: "rotated_token_123",
      siteUrl: "https://site.com",
    });
    expect(getTestMocks().prisma!.purchase.update).toHaveBeenCalledWith({
      where: { id: "pur_1" },
      data: { emailSentAt: expect.any(Date) },
    });
  });

  it("returns error if token rotation fails", async () => {
    mockRetrieve.mockResolvedValueOnce({
      payment_status: "paid",
      metadata: {
        productId: "prod_1",
        buyerName: "John Doe",
        buyerEmail: "john@example.com",
      },
    });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce({
      id: "pur_1",
      revokedAt: null,
    });
    mockRotatePurchaseDownloadToken.mockRejectedValueOnce(new Error("Rotation failed"));

    const result = await resendPurchaseEmailByStripeSession("cs_test_123", "https://site.com");
    expect(result).toEqual({
      ok: false,
      error: "Could not issue a new download link. Please try again shortly.",
    });
  });

  it("returns error if sending purchase confirmation fails", async () => {
    mockRetrieve.mockResolvedValueOnce({
      payment_status: "paid",
      metadata: {
        productId: "prod_1",
        buyerName: "John Doe",
        buyerEmail: "john@example.com",
      },
    });
    getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce({
      id: "pur_1",
      revokedAt: null,
    });
    mockRotatePurchaseDownloadToken.mockResolvedValueOnce({
      id: "pur_1",
      buyerName: "John Doe",
      buyerEmail: "john@example.com",
      product: { name: "Pro Kit" },
      downloadToken: "rotated_token_123",
    });
    mockSendPurchaseConfirmation.mockRejectedValueOnce(new Error("SMTP error"));

    const result = await resendPurchaseEmailByStripeSession("cs_test_123", "https://site.com");
    expect(result).toEqual({
      ok: false,
      error: "Could not send the email. Please try again in a few minutes.",
    });
  });
});
