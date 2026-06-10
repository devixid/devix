import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";
import { getTestMocks } from "@/lib/test/mocks/registry";
import { buildPurchase } from "@/lib/test/mocks/fixtures/purchase";
import { withFrozenTime } from "@/lib/test/mocks/redis";

vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();
  getTestMocks().prisma = mocks;
  return { prisma };
});

import { rotatePurchaseDownloadToken } from "@/lib/rotate-purchase-download-token";

describe("mock kit / prisma", () => {
  beforeEach(() => resetMockPrisma(getTestMocks().prisma!));

  it("rotates download token via mocked prisma.purchase.update", async () => {
    const mocks = getTestMocks().prisma!;

    await withFrozenTime("2026-06-08T12:00:00.000Z", async () => {
      const updated = buildPurchase({
        downloadToken: "new-token",
        downloadCount: 0,
      });
      mocks.purchase.update.mockResolvedValue(updated);

      const result = await rotatePurchaseDownloadToken("purchase_fixture_1");

      expect(mocks.purchase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "purchase_fixture_1" },
          data: expect.objectContaining({
            downloadCount: 0,
            tokenUsed: false,
          }),
        }),
      );
      expect(result.downloadToken).toBe("new-token");
    });
  });
});
