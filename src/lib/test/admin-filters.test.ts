import { describe, expect, it } from "vitest";
import { parseDateRangeFilter } from "@/lib/admin-filters";

describe("parseDateRangeFilter", () => {
  it("returns undefined when no dates are provided", () => {
    expect(parseDateRangeFilter()).toBeUndefined();
  });

  it("parses inclusive UTC day boundaries", () => {
    const range = parseDateRangeFilter("2026-06-01", "2026-06-08");
    expect(range?.gte?.toISOString()).toBe("2026-06-01T00:00:00.000Z");
    expect(range?.lte?.toISOString()).toBe("2026-06-08T23:59:59.999Z");
  });

  it("ignores invalid date strings", () => {
    expect(parseDateRangeFilter("not-a-date")).toBeUndefined();
  });
});
