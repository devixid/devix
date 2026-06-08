import { describe, expect, it } from "vitest";
import {
  buildEstimatorSteps,
  clampStepKey,
  getNextStepKey,
  getPrevStepKey,
  isStepReachable,
} from "@/lib/estimator-steps";
import type { EstimatorState } from "@/types/estimator";

const emptyState: EstimatorState = {
  type: null,
  designApproach: null,
  platform: null,
  scope: null,
  complexity: null,
  timeline: null,
  excludedDeliverableIds: [],
};

const completeCompanyProfile: EstimatorState = {
  type: "company_profile",
  designApproach: "custom",
  platform: null,
  scope: "medium",
  complexity: "standard",
  timeline: "standard",
  excludedDeliverableIds: [],
};

describe("buildEstimatorSteps", () => {
  it("includes design for template-eligible project types", () => {
    const keys = buildEstimatorSteps({
      ...emptyState,
      type: "ecommerce",
    }).map((s) => s.key);
    expect(keys).toContain("design");
  });

  it("includes platform only for mobile apps", () => {
    const webappKeys = buildEstimatorSteps({
      ...emptyState,
      type: "webapp",
    }).map((s) => s.key);
    const mobileKeys = buildEstimatorSteps({
      ...emptyState,
      type: "mobile_app",
    }).map((s) => s.key);

    expect(webappKeys).not.toContain("platform");
    expect(mobileKeys).toContain("platform");
  });
});

describe("step navigation", () => {
  it("returns next and previous keys within the flow", () => {
    expect(getNextStepKey("type", completeCompanyProfile)).toBe("design");
    expect(getPrevStepKey("scope", completeCompanyProfile)).toBe("design");
  });

  it("returns null at flow boundaries", () => {
    expect(getNextStepKey("contact", completeCompanyProfile)).toBeNull();
    expect(getPrevStepKey("type", completeCompanyProfile)).toBeNull();
  });
});

describe("isStepReachable", () => {
  it("always allows the first step", () => {
    expect(isStepReachable("type", emptyState)).toBe(true);
  });

  it("blocks result until the estimate is complete", () => {
    expect(isStepReachable("result", emptyState)).toBe(false);
    expect(isStepReachable("result", completeCompanyProfile)).toBe(true);
  });
});

describe("clampStepKey", () => {
  it("falls back to the nearest valid step for invalid keys", () => {
    expect(clampStepKey("platform", completeCompanyProfile)).toBe("design");
  });
});
