import type { EstimatorState } from "@/types/estimator";
import { supportsTemplateDesign } from "@/types/estimator";

export type EstimatorStepKey =
  | "type"
  | "design"
  | "platform"
  | "scope"
  | "complexity"
  | "timeline"
  | "customize"
  | "result"
  | "contact";

export type EstimatorStep = { key: EstimatorStepKey; title: string };

const STEP_TITLES: Record<EstimatorStepKey, string> = {
  type: "Project Type",
  design: "Design",
  platform: "Platform",
  scope: "Scope",
  complexity: "Complexity",
  timeline: "Timeline",
  customize: "Customize",
  result: "Estimation",
  contact: "Get in Touch",
};

export function buildEstimatorSteps(state: EstimatorState): EstimatorStep[] {
  const keys: EstimatorStepKey[] = ["type"];

  if (supportsTemplateDesign(state.type)) {
    keys.push("design");
  }

  if (state.type === "mobile_app") {
    keys.push("platform");
  }

  keys.push(
    "scope",
    "complexity",
    "timeline",
    "customize",
    "result",
    "contact",
  );

  return keys.map((key) => ({ key, title: STEP_TITLES[key] }));
}

export function getStepIndex(
  steps: EstimatorStep[],
  key: EstimatorStepKey,
): number {
  const index = steps.findIndex((step) => step.key === key);
  return index >= 0 ? index : 0;
}

export function getNextStepKey(
  current: EstimatorStepKey,
  state: EstimatorState,
): EstimatorStepKey | null {
  const steps = buildEstimatorSteps(state);
  const index = getStepIndex(steps, current);
  if (index < 0 || index >= steps.length - 1) return null;
  return steps[index + 1].key;
}

export function getPrevStepKey(
  current: EstimatorStepKey,
  state: EstimatorState,
): EstimatorStepKey | null {
  const steps = buildEstimatorSteps(state);
  const index = getStepIndex(steps, current);
  if (index <= 0) return null;
  return steps[index - 1].key;
}

function isEstimateComplete(state: EstimatorState): boolean {
  if (!state.type || !state.scope || !state.complexity || !state.timeline) {
    return false;
  }

  if (supportsTemplateDesign(state.type) && !state.designApproach) {
    return false;
  }

  if (state.type === "mobile_app" && !state.platform) {
    return false;
  }

  return true;
}

export function isStepReachable(
  key: EstimatorStepKey,
  state: EstimatorState,
): boolean {
  const steps = buildEstimatorSteps(state);
  if (!steps.some((step) => step.key === key)) {
    return false;
  }

  switch (key) {
    case "type":
      return true;
    case "design":
      return Boolean(state.type && supportsTemplateDesign(state.type));
    case "platform":
      return state.type === "mobile_app";
    case "scope":
      if (!state.type) return false;
      if (supportsTemplateDesign(state.type) && !state.designApproach) {
        return false;
      }
      if (state.type === "mobile_app" && !state.platform) return false;
      return true;
    case "complexity":
      return Boolean(state.scope) && isStepReachable("scope", state);
    case "timeline":
      return Boolean(state.complexity) && isStepReachable("complexity", state);
    case "customize":
      return Boolean(state.timeline) && isStepReachable("timeline", state);
    case "result":
    case "contact":
      return isEstimateComplete(state);
    default:
      return false;
  }
}

export function clampStepKey(
  key: EstimatorStepKey,
  state: EstimatorState,
): EstimatorStepKey {
  const steps = buildEstimatorSteps(state);
  const keys = steps.map((step) => step.key);

  if (keys.includes(key)) {
    if (key === "contact" && !isEstimateComplete(state)) {
      return isEstimateComplete(state) ? "result" : clampStepKey("result", state);
    }
    return key;
  }

  const allKeys: EstimatorStepKey[] = [
    "type",
    "design",
    "platform",
    "scope",
    "complexity",
    "timeline",
    "customize",
    "result",
    "contact",
  ];
  const targetIndex = allKeys.indexOf(key);

  for (let i = targetIndex; i >= 0; i--) {
    const candidate = allKeys[i];
    if (keys.includes(candidate)) {
      return candidate;
    }
  }

  return "type";
}
