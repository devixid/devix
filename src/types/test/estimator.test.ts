import { describe, expect, it } from "vitest";
import {
  BASE_PRICES,
  TEMPLATE_BASE_PRICES,
  supportsTemplateDesign,
  resolveBasePrice,
  getLowestBasePrice,
  formatDesignApproach,
  calculateEstimateUsd,
  formatUsdBasePrice,
  type EstimatorState,
  type CurrencyCode,
  type ProjectType,
} from "@/types/estimator";

describe("estimator helper functions", () => {
  it("defines base prices for every project type", () => {
    const projectTypes: ProjectType[] = [
      "company_profile",
      "ecommerce",
      "webapp",
      "mobile_app",
    ];

    for (const type of projectTypes) {
      expect(BASE_PRICES[type]).toBeGreaterThan(0);
    }
  });

  it("CurrencyCode union is enforced at compile time and checked at runtime", () => {
    const codes: CurrencyCode[] = [
      "USD",
      "IDR",
      "MYR",
      "SGD",
      "BND",
      "PHP",
      "THB",
    ];
    expect(codes).toHaveLength(7);
  });

  describe("supportsTemplateDesign", () => {
    it("returns true for company_profile and ecommerce", () => {
      expect(supportsTemplateDesign("company_profile")).toBe(true);
      expect(supportsTemplateDesign("ecommerce")).toBe(true);
    });

    it("returns false for webapp and mobile_app", () => {
      expect(supportsTemplateDesign("webapp")).toBe(false);
      expect(supportsTemplateDesign("mobile_app")).toBe(false);
      expect(supportsTemplateDesign(null)).toBe(false);
    });
  });

  describe("resolveBasePrice", () => {
    it("returns 0 if state type is null", () => {
      const state: EstimatorState = {
        type: null,
        designApproach: null,
        platform: null,
        scope: "small",
        complexity: "basic",
        timeline: "standard",
        excludedDeliverableIds: [],
      };
      expect(resolveBasePrice(state)).toBe(0);
    });

    it("returns template base price if approach is template and eligible", () => {
      const state: EstimatorState = {
        type: "ecommerce",
        designApproach: "template",
        platform: null,
        scope: "small",
        complexity: "basic",
        timeline: "standard",
        excludedDeliverableIds: [],
      };
      expect(resolveBasePrice(state)).toBe(TEMPLATE_BASE_PRICES["ecommerce"]);
    });

    it("returns custom base price if approach is custom", () => {
      const state: EstimatorState = {
        type: "ecommerce",
        designApproach: "custom",
        platform: null,
        scope: "small",
        complexity: "basic",
        timeline: "standard",
        excludedDeliverableIds: [],
      };
      expect(resolveBasePrice(state)).toBe(BASE_PRICES["ecommerce"]);
    });
  });

  describe("getLowestBasePrice", () => {
    it("returns template price for company_profile and ecommerce", () => {
      expect(getLowestBasePrice("company_profile")).toBe(TEMPLATE_BASE_PRICES["company_profile"]);
      expect(getLowestBasePrice("ecommerce")).toBe(TEMPLATE_BASE_PRICES["ecommerce"]);
    });

    it("returns custom price for webapp and mobile_app", () => {
      expect(getLowestBasePrice("webapp")).toBe(BASE_PRICES["webapp"]);
      expect(getLowestBasePrice("mobile_app")).toBe(BASE_PRICES["mobile_app"]);
    });
  });

  describe("formatDesignApproach", () => {
    it("returns md dash if null/undefined", () => {
      expect(formatDesignApproach(null)).toBe("—");
      expect(formatDesignApproach(undefined)).toBe("—");
    });

    it("maps template to Template Design", () => {
      expect(formatDesignApproach("template")).toBe("Template Design");
    });

    it("maps custom to Custom Design", () => {
      expect(formatDesignApproach("custom")).toBe("Custom Design");
    });
  });

  describe("calculateEstimateUsd", () => {
    it("returns 0 if type/scope/complexity/timeline are missing", () => {
      const state: EstimatorState = {
        type: null,
        designApproach: null,
        platform: null,
        scope: null,
        complexity: null,
        timeline: null,
        excludedDeliverableIds: [],
      };
      expect(calculateEstimateUsd(state)).toBe(0);
    });

    it("returns 0 if template eligible type has no design approach", () => {
      const state: EstimatorState = {
        type: "company_profile",
        designApproach: null,
        platform: null,
        scope: "small",
        complexity: "basic",
        timeline: "standard",
        excludedDeliverableIds: [],
      };
      expect(calculateEstimateUsd(state)).toBe(0);
    });

    it("returns 0 if mobile app has no platform", () => {
      const state: EstimatorState = {
        type: "mobile_app",
        designApproach: null,
        platform: null,
        scope: "small",
        complexity: "basic",
        timeline: "standard",
        excludedDeliverableIds: [],
      };
      expect(calculateEstimateUsd(state)).toBe(0);
    });

    it("correctly multiplies rates for custom designs", () => {
      const state: EstimatorState = {
        type: "webapp",
        designApproach: null,
        platform: null,
        scope: "medium", // 1.5x
        complexity: "standard", // 1.3x
        timeline: "rush", // 1.4x
        excludedDeliverableIds: [],
      };
      // Base for webapp = 4800
      // 4800 * 1.0 (platform) * 1.5 * 1.3 * 1.4 = 13104
      expect(calculateEstimateUsd(state)).toBeCloseTo(13104);
    });

    it("correctly multiplies rates for mobile apps", () => {
      const state: EstimatorState = {
        type: "mobile_app",
        designApproach: null,
        platform: "both", // 1.6x
        scope: "large", // 2.2x
        complexity: "premium", // 1.8x
        timeline: "relaxed", // 0.9x
        excludedDeliverableIds: [],
      };
      // Base for mobile_app = 5800
      // 5800 * 1.6 * 2.2 * 1.8 * 0.9 = 33073.92
      expect(calculateEstimateUsd(state)).toBeCloseTo(33073.92);
    });
  });

  describe("formatUsdBasePrice", () => {
    it("formats amounts in USD format", () => {
      expect(formatUsdBasePrice(1000)).toBe("$1,000");
      expect(formatUsdBasePrice(650)).toBe("$650");
    });
  });
});
