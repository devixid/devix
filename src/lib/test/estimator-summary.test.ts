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

  it("handles null/undefined and empty values in labelOrRaw", () => {
    const summary = buildEstimatorSummaryLines({
      state: {
        ...state,
        type: null,
        complexity: null,
        timeline: null,
      },
      budgetDisplay: "$0",
      currency: "USD",
    });

    const typeLine = summary.lines.find((l) => l.label === "Project Type");
    const complexityLine = summary.lines.find((l) => l.label === "Complexity");
    const timelineLine = summary.lines.find((l) => l.label === "Timeline");

    expect(typeLine?.value).toBe("Not specified");
    expect(complexityLine?.value).toBe("Not specified");
    expect(timelineLine?.value).toBe("Not specified");
  });

  it("handles custom scope and label replacement for underscores", () => {
    const summary = buildEstimatorSummaryLines({
      state: {
        ...state,
        type: "custom_type" as any,
        scope: "custom_scope" as any,
      },
      budgetDisplay: "$1,000",
      currency: "USD",
    });

    const typeLine = summary.lines.find((l) => l.label === "Project Type");
    const scopeLine = summary.lines.find((l) => l.label === "Scope");

    expect(typeLine?.value).toBe("custom type");
    expect(scopeLine?.value).toBe("custom scope");
  });

  it("includes design approach and platform when they are present in the state", () => {
    const summary = buildEstimatorSummaryLines({
      state: {
        ...state,
        type: "mobile_app",
        designApproach: "custom",
        platform: "both",
      },
      budgetDisplay: "$25,000",
      currency: "USD",
    });

    const designLine = summary.lines.find((l) => l.label === "Design");
    const platformLine = summary.lines.find((l) => l.label === "Platform");

    expect(designLine?.value).toBe("Custom Design");
    expect(platformLine?.value).toBe("Both Platforms");
  });

  it("resolves scope label using SCOPE_LABELS_APP for app project types", () => {
    const summary = buildEstimatorSummaryLines({
      state: {
        ...state,
        type: "webapp",
        scope: "large",
      },
      budgetDisplay: "$15,000",
      currency: "USD",
    });

    const scopeLine = summary.lines.find((l) => l.label === "Scope");
    expect(scopeLine?.value).toBe("13+ Screens");
  });

  it("handles empty or not specified scope values properly", () => {
    const summary = buildEstimatorSummaryLines({
      state: {
        ...state,
        scope: "Not specified" as any,
      },
      budgetDisplay: "$15,000",
      currency: "USD",
    });

    const scopeLine = summary.lines.find((l) => l.label === "Scope");
    expect(scopeLine?.value).toBe("Not specified");
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

  it("includes optional package savings, excluded labels, and rate fallbacks in text representation", () => {
    const summary = buildEstimatorSummaryLines({
      state,
      budgetDisplay: "$12,000",
      currency: "SGD",
      excludedLabels: ["Admin Panel", "Push Notifications"],
      packageSavings: 500,
      ratesError: "Connection failed",
    });
    const text = buildEstimatorSummaryText(summary);

    expect(text).toContain("Package savings (USD): $500");
    expect(text).toContain("Removed deliverables: Admin Panel, Push Notifications");
    expect(text).toContain("Note: Live exchange rates were unavailable");
  });
});
