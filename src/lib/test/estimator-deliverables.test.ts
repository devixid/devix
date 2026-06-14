import { describe, expect, it } from "vitest";
import {
  countRemovalSlots,
  getAdjustedBasePrice,
  getDependentExcludedIds,
  getRemovableItems,
  resolveExcludedDeliverables,
  validateExcludedDeliverables,
  getExcludedDeliverableLabels,
  getDeliverableDeduction,
  getScopeDeliverables,
  getDesignDeliverables,
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
  it("returns 0 if state.type is null", () => {
    expect(getAdjustedBasePrice({ ...baseState, type: null })).toBe(0);
  });

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
    ).toMatchObject({ valid: false, error: "Too many deliverable removals." });
  });

  it("rejects when a dependent deliverable is removed directly", () => {
    // ecommerce.ssl_checkout is dependent on ecommerce.payment_gateway
    expect(
      validateExcludedDeliverables("ecommerce", ["ecommerce.payment_gateway", "ecommerce.ssl_checkout"], "custom"),
    ).toMatchObject({ valid: false, error: "Dependent deliverable cannot be removed directly." });
  });

  it("rejects invalid deliverable IDs", () => {
    expect(
      validateExcludedDeliverables("company_profile", ["invalid-id"], "custom"),
    ).toMatchObject({ valid: false, error: "Invalid deliverable id." });
  });

  it("rejects non-removable/required deliverables", () => {
    expect(
      validateExcludedDeliverables("company_profile", ["company_profile.responsive"], "custom"),
    ).toMatchObject({ valid: false, error: "Deliverable is not removable." });
  });

  it("requires design approach for template-eligible types", () => {
    expect(
      validateExcludedDeliverables("ecommerce", [], null),
    ).toMatchObject({ valid: false, error: "Design approach required." });
  });
});

describe("getExcludedDeliverableLabels", () => {
  it("returns empty array if state.type is null", () => {
    expect(getExcludedDeliverableLabels({ ...baseState, type: null })).toEqual([]);
  });

  it("returns list of labels for excluded items", () => {
    const labels = getExcludedDeliverableLabels({
      ...baseState,
      excludedDeliverableIds: ["company_profile.cms"],
    });
    expect(labels).toContain("Content management system (CMS) for easy updates");
  });
});

describe("getDeliverableDeduction", () => {
  it("returns 0 if state.type is null", () => {
    expect(getDeliverableDeduction("company_profile.cms", { ...baseState, type: null })).toBe(0);
  });

  it("returns 0 if deliverable id is invalid", () => {
    expect(getDeliverableDeduction("invalid-id", baseState)).toBe(0);
  });

  it("returns scaled deduction based on template design ratio", () => {
    const customDeduction = getDeliverableDeduction("company_profile.cms", {
      ...baseState,
      designApproach: "custom",
    });
    const templateDeduction = getDeliverableDeduction("company_profile.cms", {
      ...baseState,
      designApproach: "template",
    });
    expect(templateDeduction).toBeLessThan(customDeduction);
  });
});

describe("getScopeDeliverables", () => {
  it("returns webapp deliverables for webapp type", () => {
    const result = getScopeDeliverables("webapp", "small");
    expect(result.title).toContain("Screens");
  });

  it("returns profile deliverables for company_profile type", () => {
    const result = getScopeDeliverables("company_profile", "small");
    expect(result.title).toContain("Pages");
  });
});

describe("getDesignDeliverables", () => {
  it("returns design deliverables adapted for project type", () => {
    const result = getDesignDeliverables("template", "company_profile");
    expect(result.subtitle).toContain("company profile");
  });
});
