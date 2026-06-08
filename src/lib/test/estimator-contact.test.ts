import { describe, expect, it } from "vitest";
import { buildEstimatorContactMessage } from "@/lib/estimator-contact";

describe("buildEstimatorContactMessage", () => {
  it("includes formatted estimator selections", () => {
    const message = buildEstimatorContactMessage({
      type: "company_profile",
      scope: "medium",
      complexity: "standard",
      timeline: "standard",
      design: "custom",
      budget: "$5,000",
      excludedLabels: ["CMS"],
    });

    expect(message).toContain("Project Type: Company Profile");
    expect(message).toContain("Scope:");
    expect(message).toContain("Estimated Budget: $5,000");
    expect(message).toContain("Removed deliverables: CMS");
  });

  it("omits optional sections when not provided", () => {
    const message = buildEstimatorContactMessage({
      type: "webapp",
      scope: "small",
      complexity: "basic",
      timeline: "relaxed",
    });

    expect(message).not.toContain("Platform:");
    expect(message).not.toContain("Removed deliverables:");
  });
});
