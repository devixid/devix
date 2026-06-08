import { describe, expect, it } from "vitest";
import { buildEstimatorFingerprint } from "@/lib/estimator-fingerprint";
import type { EstimatorState } from "@/types/estimator";

const baseState: EstimatorState = {
  type: "webapp",
  designApproach: "custom",
  platform: "both",
  scope: "medium",
  complexity: "standard",
  timeline: "standard",
  excludedDeliverableIds: ["b", "a"],
};

describe("buildEstimatorFingerprint", () => {
  it("sorts excluded deliverables for stable fingerprints", () => {
    const fp1 = buildEstimatorFingerprint(baseState, "USD");
    const fp2 = buildEstimatorFingerprint(
      { ...baseState, excludedDeliverableIds: ["a", "b"] },
      "USD",
    );
    expect(fp1).toBe(fp2);
  });

  it("includes currency in the payload", () => {
    const usd = buildEstimatorFingerprint(baseState, "USD");
    const idr = buildEstimatorFingerprint(baseState, "IDR");
    expect(usd).not.toBe(idr);
    expect(JSON.parse(usd).currency).toBe("USD");
  });
});
