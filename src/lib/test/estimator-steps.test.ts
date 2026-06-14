import { describe, expect, it } from "vitest";
import {
  buildEstimatorSteps,
  clampStepKey,
  getNextStepKey,
  getPrevStepKey,
  isStepReachable,
  getStepIndex,
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

describe("getStepIndex", () => {
  it("returns 0 if key is not found in steps", () => {
    const steps = buildEstimatorSteps(completeCompanyProfile);
    expect(getStepIndex(steps, "platform")).toBe(0);
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

  it("checks design step reachability", () => {
    expect(isStepReachable("design", emptyState)).toBe(false);
    expect(isStepReachable("design", { ...emptyState, type: "company_profile" })).toBe(true);
    expect(isStepReachable("design", { ...emptyState, type: "webapp" })).toBe(false);
  });

  it("checks platform step reachability", () => {
    expect(isStepReachable("platform", emptyState)).toBe(false);
    expect(isStepReachable("platform", { ...emptyState, type: "mobile_app" })).toBe(true);
    expect(isStepReachable("platform", { ...emptyState, type: "webapp" })).toBe(false);
  });

  it("checks scope step reachability", () => {
    expect(isStepReachable("scope", emptyState)).toBe(false);
    expect(isStepReachable("scope", { ...emptyState, type: "company_profile" })).toBe(false); // missing designApproach
    expect(isStepReachable("scope", { ...emptyState, type: "company_profile", designApproach: "custom" })).toBe(true);
    expect(isStepReachable("scope", { ...emptyState, type: "mobile_app" })).toBe(false); // missing platform
    expect(isStepReachable("scope", { ...emptyState, type: "mobile_app", platform: "android" })).toBe(true);
  });

  it("checks complexity, timeline and customize step reachability", () => {
    expect(isStepReachable("complexity", emptyState)).toBe(false);
    expect(isStepReachable("complexity", { ...completeCompanyProfile, scope: null })).toBe(false);
    expect(isStepReachable("complexity", completeCompanyProfile)).toBe(true);

    expect(isStepReachable("timeline", { ...completeCompanyProfile, complexity: null })).toBe(false);
    expect(isStepReachable("timeline", completeCompanyProfile)).toBe(true);

    expect(isStepReachable("customize", { ...completeCompanyProfile, timeline: null })).toBe(false);
    expect(isStepReachable("customize", completeCompanyProfile)).toBe(true);
  });

  it("returns false for invalid step key", () => {
    expect(isStepReachable("platform", completeCompanyProfile)).toBe(false); // not defined in company profile steps
  });
});

describe("clampStepKey", () => {
  it("falls back to the nearest valid step for invalid keys", () => {
    expect(clampStepKey("platform", completeCompanyProfile)).toBe("design");
  });

  it("clamps contact key to result if estimate is not complete", () => {
    expect(clampStepKey("contact", emptyState)).toBe("result");
  });

  it("returns type as fallback when candidate search fails", () => {
    // If the candidate loop runs fully
    expect(clampStepKey("type", emptyState)).toBe("type");
  });
});
