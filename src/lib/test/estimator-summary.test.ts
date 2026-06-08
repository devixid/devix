import { describe, expect, it } from "vitest";
import {
  buildEstimatorSummaryLines,
  buildEstimatorSummaryText,
} from "@/lib/estimator-summary";
import type { EstimatorState } from "@/types/estimator";

const state: EstimatorState = {
  type: "webapp",
  designApproach: null,
  platform: null,
  scope: "medium",
  complexity: "standard",
  timeline: "relaxed",
  excludedDeliverableIds: [],
};

describe("buildEstimatorSummaryLines", () => {
  it("builds labeled summary lines from estimator state", () => {
    const summary = buildEstimatorSummaryLines({
      state,
      budgetDisplay: "$12,000",
      currency: "USD",
      excludedLabels: ["CMS"],
      packageSavings: 200,
      ratesError: "offline",
    });

    expect(summary.title).toContain("Devix");
    expect(summary.lines.some((line) => line.label === "Project Type")).toBe(
      true,
    );
    expect(summary.budgetDisplay).toBe("$12,000");
    expect(summary.packageSavingsUsd).toBe(200);
    expect(summary.ratesFallback).toBe(true);
    expect(summary.excludedLabels).toEqual(["CMS"]);
  });
});

describe("buildEstimatorSummaryText", () => {
  it("renders a plain-text export", () => {
    const summary = buildEstimatorSummaryLines({
      state,
      budgetDisplay: "$12,000",
      currency: "USD",
    });
    const text = buildEstimatorSummaryText(summary);

    expect(text).toContain("Project Type:");
    expect(text).toContain("Estimated Budget (USD): $12,000");
    expect(text).toContain("indicative estimate only");
  });
});
