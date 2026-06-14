import { describe, expect, it, vi, beforeEach } from "vitest";
import { getTestMocks } from "@/lib/test/mocks/registry";
import { prisma } from "@/lib/prisma";

// Mock Prisma
vi.mock("@/lib/prisma", async () => {
  const { createMockPrisma } = await import("@/lib/test/mocks/prisma");
  const { getTestMocks } = await import("@/lib/test/mocks/registry");
  const { prisma, mocks } = createMockPrisma();

  // Extend mocks to support analytical methods not in standard delegate mocks
  (mocks.contactSubmission as any).groupBy = vi.fn();
  (mocks.estimatorLead as any).groupBy = vi.fn();
  (mocks.estimatorLead as any).count = vi.fn();
  (mocks.estimatorLead as any).aggregate = vi.fn();
  (mocks.estimatorLead as any).findMany = vi.fn();
  (mocks.purchase as any).aggregate = vi.fn();
  (mocks.purchase as any).findMany = vi.fn();

  (prisma as any).$queryRaw = vi.fn();

  getTestMocks().prisma = mocks;

  return { prisma };
});

// Mock Auth to bypass session validation
vi.mock("@/lib/auth", () => ({
  verifyAdminSession: vi.fn().mockResolvedValue({ id: "admin_1" }),
}));

// Mock Redis to run query fetcher immediately
vi.mock("@/lib/redis", () => ({
  cachedQuery: async <T>(_key: string, fetcher: () => Promise<T>) => {
    return fetcher();
  },
  invalidateCache: vi.fn(),
}));

import { getAnalyticsSummary } from "@/actions/admin/analytics";

function safeResetMockPrisma(mocks: any) {
  for (const delegate of Object.values(mocks)) {
    if (delegate && typeof delegate === "object") {
      for (const method of Object.values(delegate)) {
        if (method && typeof method === "object" && "mockReset" in method && typeof (method as any).mockReset === "function") {
          (method as any).mockReset();
        }
      }
    }
  }
}

describe("getAnalyticsSummary server action", () => {
  beforeEach(() => {
    const mocks = getTestMocks().prisma! as any;
    safeResetMockPrisma(mocks);
    (prisma as any).$queryRaw.mockReset();
  });

  it("aggregates database results and returns summary details", async () => {
    const mocks = getTestMocks().prisma! as any;
    const queryRawMock = (prisma as any).$queryRaw;

    // Mock inquiriesByDay raw query
    queryRawMock.mockResolvedValueOnce([
      { day: new Date("2026-06-01T00:00:00.000Z"), count: 3n },
      { day: new Date("2026-06-02T00:00:00.000Z"), count: 5n },
    ]);

    // Mock leadsByDay raw query
    queryRawMock.mockResolvedValueOnce([
      { day: new Date("2026-06-01T00:00:00.000Z"), count: 2n },
    ]);

    // Mock sourceBreakdown
    mocks.contactSubmission.groupBy.mockResolvedValueOnce([
      { source: "GOOGLE", _count: 4 },
      { source: "DIRECT", _count: 2 },
    ]);

    // Mock leadStatusBreakdown
    mocks.estimatorLead.groupBy.mockResolvedValueOnce([
      { status: "NEW", _count: 3 },
      { status: "CONVERTED", _count: 2 },
    ]);

    // Mock totalLeads
    mocks.estimatorLead.count.mockResolvedValueOnce(5);

    // Mock convertedLeads
    mocks.estimatorLead.count.mockResolvedValueOnce(2);

    // Mock totalRevenueResult (amountMinor sum)
    mocks.purchase.aggregate.mockResolvedValueOnce({
      _sum: {
        amountMinor: 25000,
      },
    });

    // Mock budgetStats (average estimator project budget)
    mocks.estimatorLead.aggregate.mockResolvedValueOnce({
      _avg: {
        budgetUsd: 15000,
      },
    });

    // Mock purchasesMoM findMany
    mocks.purchase.findMany.mockResolvedValueOnce([
      { createdAt: new Date("2026-06-05T10:00:00.000Z"), amountMinor: 10000 },
      { createdAt: new Date("2026-05-12T10:00:00.000Z"), amountMinor: 15000 },
    ]);

    // Mock leadsMoM findMany
    mocks.estimatorLead.findMany.mockResolvedValueOnce([
      { createdAt: new Date("2026-06-06T10:00:00.000Z") },
    ]);

    // Mock projectTypeStats groupBy
    mocks.estimatorLead.groupBy.mockResolvedValueOnce([
      { projectType: "WEB", _count: 3 },
      { projectType: "MOBILE", _count: 2 },
    ]);

    const result = await getAnalyticsSummary(30);

    expect(result.totalRevenue).toBe(250);
    expect(result.averageBudget).toBe(15000);
    expect(result.totalLeads).toBe(5);
    expect(result.convertedLeads).toBe(2);
    expect(result.conversionRate).toBe(40); // 2 / 5 * 100 = 40%

    // Verify Project Type Breakdown mapping
    expect(result.projectTypeBreakdown).toEqual([
      { type: "WEB", count: 3 },
      { type: "MOBILE", count: 2 },
    ]);

    // Verify MoM trend calculations
    expect(result.monthlyTrend).toBeInstanceOf(Array);
    expect(result.monthlyTrend.length).toBe(6);

    // Verify details of inquiriesByDay and leadsByDay mapping
    expect(result.inquiriesByDay[0]).toEqual({
      day: "2026-06-01",
      count: 3,
    });
    expect(result.leadsByDay[0]).toEqual({
      day: "2026-06-01",
      count: 2,
    });
  });
});
