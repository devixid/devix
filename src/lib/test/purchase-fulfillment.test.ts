import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { getTestMocks } from "@/lib/test/mocks/registry";
import { Prisma } from "@prisma/client";
import { Decimal } from "@/lib/money";

// ── Prisma mock ────
vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

import "@/lib/prisma";

// ── Other mocks ────
vi.mock("@/lib/email", () => {
  const sendPurchaseConfirmation = vi.fn();
  (globalThis as any).__sendPurchaseConfirmationMock = sendPurchaseConfirmation;
  return { sendPurchaseConfirmation };
});

vi.mock("@/lib/tokens", () => ({
  generateDownloadToken: vi.fn(() => "mocked_token"),
}));

let mockSendPurchaseConfirmation: any;

import {
  fulfillProductPurchase,
  fulfillmentEventToInput,
  fulfillFromPaymentEvent,
} from "@/lib/purchase-fulfillment";
import { buildProduct, buildPurchase } from "@/lib/test/mocks/fixtures/purchase";

describe("purchase-fulfillment tests", () => {
  beforeEach(() => {
    mockSendPurchaseConfirmation = (globalThis as any).__sendPurchaseConfirmationMock;
    resetMockPrisma(getTestMocks().prisma!);
    mockSendPurchaseConfirmation.mockClear();
    process.env.NEXT_PUBLIC_SITE_URL = "https://default.com";
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  describe("fulfillmentEventToInput", () => {
    it("maps stripe fulfillment events", () => {
      const event = {
        provider: "stripe" as const,
        productId: "prod_1",
        buyerName: "Buyer",
        buyerEmail: "buyer@example.com",
        stripeSessionId: "cs_test",
        stripePaymentIntentId: "pi_test",
        amountMinor: new Decimal("2500"),
        currency: "usd",
        buyerIp: "127.0.0.1",
        userAgent: "vitest",
        siteUrl: "https://devix.test",
      };

      expect(fulfillmentEventToInput(event)).toEqual({
        provider: "stripe",
        productId: "prod_1",
        buyerName: "Buyer",
        buyerEmail: "buyer@example.com",
        stripeSessionId: "cs_test",
        stripePaymentIntentId: "pi_test",
        stripeChargeId: undefined,
        lemonSqueezyOrderId: undefined,
        amountMinor: new Decimal("2500"),
        currency: "usd",
        buyerIp: "127.0.0.1",
        userAgent: "vitest",
        siteUrl: "https://devix.test",
      });
    });
  });

  describe("fulfillProductPurchase", () => {
    it("returns existing purchase if found by stripeSessionId", async () => {
      const purchase = { id: "pur_1", emailSentAt: new Date() };
      getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(purchase);

      const result = await fulfillProductPurchase({
        productId: "prod_1",
        buyerName: "User",
        buyerEmail: "user@example.com",
        stripeSessionId: "cs_123",
      });

      expect(result).toBe(purchase);
      expect(getTestMocks().prisma!.purchase.findUnique).toHaveBeenCalledWith({
        where: { stripeSessionId: "cs_123" },
        include: { product: true },
      });
    });

    it("returns existing purchase if found by stripePaymentIntentId", async () => {
      const purchase = { id: "pur_2", emailSentAt: new Date() };
      getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(purchase);

      const result = await fulfillProductPurchase({
        productId: "prod_1",
        buyerName: "User",
        buyerEmail: "user@example.com",
        stripePaymentIntentId: "pi_123",
      });

      expect(result).toBe(purchase);
    });

    it("returns existing purchase if found by lemonsqueezyOrderId", async () => {
      const purchase = { id: "pur_3", emailSentAt: new Date() };
      getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(purchase);

      const result = await fulfillProductPurchase({
        productId: "prod_1",
        buyerName: "User",
        buyerEmail: "user@example.com",
        lemonSqueezyOrderId: "ls_123",
      });

      expect(result).toBe(purchase);
    });

    it("throws error if product does not exist", async () => {
      getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(null);
      getTestMocks().prisma!.product.findUnique.mockResolvedValue(null);

      await expect(
        fulfillProductPurchase({
          productId: "prod_1",
          buyerName: "User",
          buyerEmail: "user@example.com",
        }),
      ).rejects.toThrow("Product not found or unavailable.");
    });

    it("throws error if product is not visible", async () => {
      getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(null);
      getTestMocks().prisma!.product.findUnique.mockResolvedValue({
        id: "prod_1",
        isVisible: false,
      });

      await expect(
        fulfillProductPurchase({
          productId: "prod_1",
          buyerName: "User",
          buyerEmail: "user@example.com",
        }),
      ).rejects.toThrow("Product not found or unavailable.");
    });

    it("creates a purchase and sends email when purchase does not exist", async () => {
      const product = buildProduct({ id: "prod_1", name: "Pro Template", fileKey: "file_key_1", currency: "USD" });
      const purchase = buildPurchase({
        id: "pur_new",
        buyerName: "User",
        buyerEmail: "user@example.com",
        downloadToken: "mocked_token",
        emailSentAt: null,
      });
      purchase.product = product;

      getTestMocks().prisma!.purchase.findUnique.mockResolvedValue(null);
      getTestMocks().prisma!.product.findUnique.mockResolvedValue(product);
      getTestMocks().prisma!.purchase.create.mockResolvedValue(purchase);
      getTestMocks().prisma!.purchase.update.mockResolvedValue({
        ...purchase,
        emailSentAt: new Date(),
      });

      const result = await fulfillProductPurchase({
        productId: "prod_1",
        buyerName: "User",
        buyerEmail: "user@example.com",
        siteUrl: "https://mysite.com/",
      });

      expect(result.emailSentAt).toBeDefined();
      expect(getTestMocks().prisma!.purchase.create).toHaveBeenCalled();
      expect(mockSendPurchaseConfirmation).toHaveBeenCalledWith({
        name: "User",
        email: "user@example.com",
        productName: "Pro Template",
        downloadToken: "mocked_token",
        siteUrl: "https://mysite.com",
      });
    });

    it("handles concurrent unique violations and resolves to the existing purchase", async () => {
      const product = buildProduct({ id: "prod_1", name: "Pro Template" });
      const purchase = buildPurchase({ id: "pur_existing", emailSentAt: new Date() });
      purchase.product = product;

      getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(null);
      getTestMocks().prisma!.product.findUnique.mockResolvedValue(product);

      const err = new Prisma.PrismaClientKnownRequestError("Duplicate", {
        code: "P2002",
        clientVersion: "7.8.0",
      });
      getTestMocks().prisma!.purchase.create.mockRejectedValueOnce(err);
      getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(purchase);

      const result = await fulfillProductPurchase({
        productId: "prod_1",
        buyerName: "User",
        buyerEmail: "user@example.com",
        stripeSessionId: "cs_123",
      });

      expect(result).toBe(purchase);
    });

    it("rethrows database errors other than unique constraint violations", async () => {
      const product = buildProduct({ id: "prod_1" });
      getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(null);
      getTestMocks().prisma!.product.findUnique.mockResolvedValue(product);
      getTestMocks().prisma!.purchase.create.mockRejectedValueOnce(new Error("Database crash"));

      await expect(
        fulfillProductPurchase({
          productId: "prod_1",
          buyerName: "User",
          buyerEmail: "user@example.com",
        }),
      ).rejects.toThrow("Database crash");
    });

    it("throws if purchase cannot be resolved after concurrent create unique violation", async () => {
      const product = buildProduct({ id: "prod_1" });
      getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(null);
      getTestMocks().prisma!.product.findUnique.mockResolvedValue(product);

      const err = new Prisma.PrismaClientKnownRequestError("Duplicate", {
        code: "P2002",
        clientVersion: "7.8.0",
      });
      getTestMocks().prisma!.purchase.create.mockRejectedValueOnce(err);
      getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(null);

      await expect(
        fulfillProductPurchase({
          productId: "prod_1",
          buyerName: "User",
          buyerEmail: "user@example.com",
          stripeSessionId: "cs_123",
        }),
      ).rejects.toThrow("Failed to resolve purchase after concurrent create.");
    });
  });

  describe("fulfillFromPaymentEvent", () => {
    it("converts event and fulfills successfully", async () => {
      const event = {
        provider: "stripe" as const,
        productId: "prod_1",
        buyerName: "Buyer",
        buyerEmail: "buyer@example.com",
        stripeSessionId: "cs_test",
      };
      const purchase = { id: "pur_1", emailSentAt: new Date() };
      getTestMocks().prisma!.purchase.findUnique.mockResolvedValueOnce(purchase);

      const result = await fulfillFromPaymentEvent(event);
      expect(result).toBe(purchase);
    });
  });
});
