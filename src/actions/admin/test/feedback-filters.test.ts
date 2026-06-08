import { describe, expect, it } from "vitest";
import { parseDateRangeFilter } from "@/lib/admin-filters";
import type { FeedbackReadFilter } from "@/actions/admin/feedback";

function buildFeedbackDateFilter(dateFrom?: string, dateTo?: string) {
  const createdAt = parseDateRangeFilter(dateFrom, dateTo);
  return createdAt ? { createdAt } : {};
}

describe("admin feedback list filters", () => {
  it("maps read filter values", () => {
    const filters: FeedbackReadFilter[] = ["all", "unread", "read"];
    expect(filters).toContain("unread");
  });

  it("builds prisma date filters from admin query params", () => {
    expect(buildFeedbackDateFilter("2026-06-01", "2026-06-08")).toEqual({
      createdAt: {
        gte: new Date("2026-06-01T00:00:00.000Z"),
        lte: new Date("2026-06-08T23:59:59.999Z"),
      },
    });
    expect(buildFeedbackDateFilter()).toEqual({});
  });
});
