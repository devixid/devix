import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  expectEmailSent,
  resetEmailMocks,
} from "@/lib/test/mocks/email";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { getTestMocks } from "@/lib/test/mocks/registry";
import { buildProduct, buildPurchase } from "@/lib/test/mocks/fixtures/purchase";

vi.mock("@/lib/email", async () => {
  const { createEmailMocks } = await import("@/lib/test/mocks/email");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const emailMocks = createEmailMocks();
  getTestMocks().email = emailMocks;
  return emailMocks;
});

vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

import { fulfillProductPurchase } from "@/lib/purchase-fulfillment";

describe("mock kit / email", () => {
  beforeEach(() => {
    resetEmailMocks(getTestMocks().email!);
    resetMockPrisma(getTestMocks().prisma!);
    process.env.NEXT_PUBLIC_SITE_URL = "https://devix.test";
  });

  it("sends purchase confirmation once for a new fulfillment", async () => {
    const prismaMocks = getTestMocks().prisma!;
    const emailMocks = getTestMocks().email!;
    const product = buildProduct();
    const purchase = buildPurchase({ emailSentAt: null });

    prismaMocks.purchase.findUnique.mockResolvedValue(null);
    prismaMocks.product.findUnique.mockResolvedValue(product);
    prismaMocks.purchase.create.mockResolvedValue(purchase);
    prismaMocks.purchase.update.mockResolvedValue({
      ...purchase,
      emailSentAt: new Date("2026-06-08T12:00:00.000Z"),
    });

    await fulfillProductPurchase({
      productId: product.id,
      buyerName: purchase.buyerName,
      buyerEmail: purchase.buyerEmail,
      stripeSessionId: purchase.stripeSessionId ?? undefined,
    });

    expectEmailSent(emailMocks.sendPurchaseConfirmation, {
      email: "jane@example.com",
      productName: "Starter Kit",
    });
    expect(prismaMocks.purchase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: purchase.id },
        data: expect.objectContaining({ emailSentAt: expect.any(Date) }),
      }),
    );
  });
});
