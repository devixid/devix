import { describe, expect, it } from "vitest";
import { buildEstimatorLeadsWhereClause } from "@/lib/admin-leads-query";

describe("buildEstimatorLeadsWhereClause", () => {
  it("returns empty filter by default", () => {
    expect(buildEstimatorLeadsWhereClause()).toEqual({});
  });

  it("filters by valid status", () => {
    expect(buildEstimatorLeadsWhereClause({ status: "NEW" })).toEqual({
      status: "NEW",
    });
    expect(buildEstimatorLeadsWhereClause({ status: "all" })).toEqual({});
    expect(buildEstimatorLeadsWhereClause({ status: "invalid" })).toEqual({});
  });

  it("applies date range and text search", () => {
    expect(
      buildEstimatorLeadsWhereClause({
        dateFrom: "2026-06-01",
        dateTo: "2026-06-08",
        query: "webapp",
      }),
    ).toEqual({
      createdAt: {
        gte: new Date("2026-06-01T00:00:00.000Z"),
        lte: new Date("2026-06-08T23:59:59.999Z"),
      },
      OR: [
        { projectType: { contains: "webapp", mode: "insensitive" } },
        { scope: { contains: "webapp", mode: "insensitive" } },
        { budgetDisplay: { contains: "webapp", mode: "insensitive" } },
      ],
    });
  });
});
