/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearEstimatorSession,
  loadEstimatorSession,
  saveEstimatorSession,
} from "@/lib/estimator-session";
import type { EstimatorState } from "@/types/estimator";

const state: EstimatorState = {
  type: "webapp",
  designApproach: null,
  platform: null,
  scope: "medium",
  complexity: "standard",
  timeline: "standard",
  excludedDeliverableIds: [],
};

describe("estimator session storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when nothing is stored", () => {
    expect(loadEstimatorSession()).toBeNull();
  });

  it("round-trips a valid session", () => {
    saveEstimatorSession({
      state,
      currentStepKey: "scope",
      currency: "USD",
      contactLeadId: null,
      savedFingerprint: null,
      updatedAt: Date.now(),
    });

    const loaded = loadEstimatorSession();
    expect(loaded?.state.type).toBe("webapp");
    expect(loaded?.currentStepKey).toBe("scope");
    expect(loaded?.currency).toBe("USD");
  });

  it("expires sessions after the TTL", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-08T12:00:00.000Z"));

    saveEstimatorSession({
      state,
      currentStepKey: "type",
      currency: "USD",
      contactLeadId: null,
      savedFingerprint: null,
      updatedAt: Date.now(),
    });

    vi.setSystemTime(new Date("2026-06-10T12:00:00.000Z"));
    expect(loadEstimatorSession()).toBeNull();
  });

  it("clears stored data", () => {
    saveEstimatorSession({
      state,
      currentStepKey: "type",
      currency: "USD",
      contactLeadId: null,
      savedFingerprint: null,
      updatedAt: Date.now(),
    });
    clearEstimatorSession();
    expect(loadEstimatorSession()).toBeNull();
  });
});
