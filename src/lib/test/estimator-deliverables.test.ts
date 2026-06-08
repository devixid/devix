import { describe, expect, it } from "vitest";
import {
  countRemovalSlots,
  getAdjustedBasePrice,
  getDependentExcludedIds,
  getRemovableItems,
  resolveExcludedDeliverables,
  validateExcludedDeliverables,
} from "@/lib/estimator-deliverables";
import type { EstimatorState } from "@/types/estimator";
import { BASE_PRICES } from "@/types/estimator";

const baseState: EstimatorState = {
  type: "company_profile",
  designApproach: "custom",
  platform: null,
  scope: "medium",
  complexity: "standard",
  timeline: "standard",
  excludedDeliverableIds: [],
};

describe("getRemovableItems", () => {
  it("excludes required deliverables", () => {
    const removable = getRemovableItems("company_profile");
    expect(removable.every((item) => !item.required)).toBe(true);
    expect(removable.some((item) => item.id === "company_profile.cms")).toBe(true);
  });
});

describe("resolveExcludedDeliverables", () => {
  it("auto-includes dependency ids", () => {
    const resolved = resolveExcludedDeliverables(["ecommerce.payment_gateway"]);
    expect(resolved).toContain("ecommerce.ssl_checkout");
  });
});

describe("countRemovalSlots", () => {
  it("does not count dependency-only exclusions toward the limit", () => {
    expect(
      countRemovalSlots(["ecommerce.payment_gateway", "ecommerce.ssl_checkout"]),
    ).toBe(1);
  });
});

describe("getDependentExcludedIds", () => {
  it("returns child ids for known parents", () => {
    const dependent = getDependentExcludedIds(["ecommerce.payment_gateway"]);
    expect(dependent.has("ecommerce.ssl_checkout")).toBe(true);
  });
});

describe("getAdjustedBasePrice", () => {
  it("reduces price when optional deliverables are removed", () => {
    const withoutRemovals = getAdjustedBasePrice(baseState);
    const withRemoval = getAdjustedBasePrice({
      ...baseState,
      excludedDeliverableIds: ["company_profile.cms"],
    });
    expect(withRemoval).toBeLessThan(withoutRemovals);
    expect(withoutRemovals).toBe(BASE_PRICES.company_profile);
  });

  it("respects the price floor ratio", () => {
    const allRemovable = getRemovableItems("company_profile").map((i) => i.id);
    const floored = getAdjustedBasePrice({
      ...baseState,
      excludedDeliverableIds: allRemovable,
    });
    expect(floored).toBeGreaterThanOrEqual(BASE_PRICES.company_profile * 0.55);
  });
});

describe("validateExcludedDeliverables", () => {
  it("accepts valid removable selections", () => {
    expect(
      validateExcludedDeliverables(
        "company_profile",
        ["company_profile.cms"],
        "custom",
      ),
    ).toEqual({ valid: true });
  });

  it("rejects too many removals", () => {
    const ids = getRemovableItems("company_profile")
      .slice(0, 6)
      .map((item) => item.id);
    expect(
      validateExcludedDeliverables("company_profile", ids, "custom"),
    ).toMatchObject({ valid: false });
  });

  it("requires design approach for template-eligible types", () => {
    expect(
      validateExcludedDeliverables("ecommerce", [], null),
    ).toMatchObject({ valid: false });
  });
});
