import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getTestMocks } from "@/lib/test/mocks/registry";
import { resetMockPrisma } from "@/lib/test/mocks/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();

  // Extend mocks to support findMany for purchase delegate
  (mocks.purchase as any).findMany = vi.fn();

  getTestMocks().prisma = mocks;
  return { prisma };
});

// Mock Auth
vi.mock("@/lib/auth", () => ({
  verifyAdminSession: vi.fn(),
}));

import { GET } from "../route";
import { verifyAdminSession } from "@/lib/auth";

const mockVerifyAdminSession = vi.mocked(verifyAdminSession);

describe("GET /api/admin/purchases/export", () => {
  beforeEach(() => {
    resetMockPrisma(getTestMocks().prisma!);
    const mocks = getTestMocks().prisma! as any;
    mocks.purchase.findMany.mockReset();
    mockVerifyAdminSession.mockReset();
  });

  it("returns 401 Unauthorized if admin session is invalid", async () => {
    mockVerifyAdminSession.mockRejectedValueOnce(new Error("Unauthorized"));

    const req = new NextRequest("http://localhost/api/admin/purchases/export");
    const response = await GET(req);

    expect(response.status).toBe(401);
    const json = await response.json();
    expect(json).toEqual({ error: "Unauthorized" });
  });

  it("returns 200 with CSV content when session is valid", async () => {
    mockVerifyAdminSession.mockResolvedValueOnce({ id: "admin_1" });
    const mocks = getTestMocks().prisma! as any;

    const mockPurchases = [
      {
        id: "purchase_1",
        buyerName: "John Doe",
        buyerEmail: "john@example.com",
        productId: "prod_1",
        createdAt: new Date("2026-06-05T12:00:00.000Z"),
        amountMinor: 2500n, // $25.00
        currency: "usd",
        provider: "stripe",
        tokenExpiresAt: new Date("2030-06-06T12:00:00.000Z"),
        downloadCount: 1,
        maxDownloads: 3,
        stripeSessionId: "sess_123",
        lemonSqueezyOrderId: null,
        disputeStatus: null,
        revokedAt: null,
        product: {
          name: "Premium Template",
        },
      },
    ];

    mocks.purchase.findMany.mockResolvedValueOnce(mockPurchases);

    const req = new NextRequest(
      "http://localhost/api/admin/purchases/export?dateFrom=2026-06-01&dateTo=2026-06-10"
    );
    const response = await GET(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(response.headers.get("Content-Disposition")).toContain("attachment; filename=");

    const text = await response.text();
    // Verify headers are present in the CSV body
    expect(text).toContain("buyerName,buyerEmail,productId,productName,createdAt,amount");
    // Verify row details are present
    expect(text).toContain("John Doe");
    expect(text).toContain("john@example.com");
    expect(text).toContain("Premium Template");
    expect(text).toContain("25.00");
    expect(text).toContain("Active");

    // Verify DB query was filtered by dates
    expect(mocks.purchase.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          createdAt: {
            gte: new Date("2026-06-01T00:00:00.000Z"),
            lte: new Date("2026-06-10T23:59:59.999Z"),
          },
        }),
      })
    );
  });
});
