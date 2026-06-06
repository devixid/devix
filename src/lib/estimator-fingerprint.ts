import type { CurrencyCode, EstimatorState } from "@/types/estimator";

export function buildEstimatorFingerprint(
  state: EstimatorState,
  currency: CurrencyCode,
): string {
  const payload = {
    type: state.type,
    designApproach: state.designApproach,
    platform: state.platform,
    scope: state.scope,
    complexity: state.complexity,
    timeline: state.timeline,
    excludedDeliverableIds: [...state.excludedDeliverableIds].sort(),
    currency,
  };

  return JSON.stringify(payload);
}
