import { getAdjustedBasePrice } from "@/lib/estimator-deliverables";

export type ProjectType = "company_profile" | "ecommerce" | "webapp" | "mobile_app";
export type PlatformType = "android" | "ios" | "both";
export type ProjectScope = "small" | "medium" | "large";
export type ProjectComplexity = "basic" | "standard" | "premium";
export type ProjectTimeline = "relaxed" | "standard" | "rush";
export type DesignApproach = "custom" | "template";

export type TemplateEligibleType = Extract<ProjectType, "company_profile" | "ecommerce">;

export type CurrencyCode = "USD" | "IDR" | "MYR" | "SGD" | "BND" | "PHP" | "THB";

export interface EstimatorState {
  type: ProjectType | null;
  designApproach: DesignApproach | null;
  platform: PlatformType | null;
  scope: ProjectScope | null;
  complexity: ProjectComplexity | null;
  timeline: ProjectTimeline | null;
  excludedDeliverableIds: string[];
}

/** USD base anchors — custom design, boutique international positioning */
export const BASE_PRICES: Record<ProjectType, number> = {
  company_profile: 1200,
  ecommerce: 2800,
  webapp: 4800,
  mobile_app: 5800,
};

/** Reduced base when using a pre-built template (company profile & e-commerce only) */
export const TEMPLATE_BASE_PRICES: Record<TemplateEligibleType, number> = {
  company_profile: 650,
  ecommerce: 1600,
};

export const PLATFORM_MULTIPLIERS: Record<PlatformType, number> = {
  android: 1.0,
  ios: 1.0,
  both: 1.6,
};

export const SCOPE_MULTIPLIERS: Record<ProjectScope, number> = {
  small: 1.0,
  medium: 1.5,
  large: 2.2,
};

export const COMPLEXITY_MULTIPLIERS: Record<ProjectComplexity, number> = {
  basic: 1.0,
  standard: 1.3,
  premium: 1.8,
};

export const TIMELINE_MULTIPLIERS: Record<ProjectTimeline, number> = {
  relaxed: 0.9,
  standard: 1.0,
  rush: 1.4,
};

export function supportsTemplateDesign(
  type: ProjectType | null,
): type is TemplateEligibleType {
  return type === "company_profile" || type === "ecommerce";
}

export function resolveBasePrice(state: EstimatorState): number {
  if (!state.type) return 0;

  if (
    state.designApproach === "template" &&
    supportsTemplateDesign(state.type)
  ) {
    return TEMPLATE_BASE_PRICES[state.type];
  }

  return BASE_PRICES[state.type];
}

export function getLowestBasePrice(type: ProjectType): number {
  if (supportsTemplateDesign(type)) {
    return TEMPLATE_BASE_PRICES[type];
  }
  return BASE_PRICES[type];
}

export function formatDesignApproach(
  approach: DesignApproach | null | undefined,
): string {
  if (!approach) return "—";
  return approach === "template" ? "Template Design" : "Custom Design";
}

export function calculateEstimateUsd(state: EstimatorState): number {
  if (!state.type || !state.scope || !state.complexity || !state.timeline) {
    return 0;
  }

  if (supportsTemplateDesign(state.type) && !state.designApproach) {
    return 0;
  }

  if (state.type === "mobile_app" && !state.platform) {
    return 0;
  }

  const adjustedBase = getAdjustedBasePrice(state);
  const platformMult =
    state.type === "mobile_app" && state.platform
      ? PLATFORM_MULTIPLIERS[state.platform]
      : 1.0;

  return (
    adjustedBase *
    platformMult *
    SCOPE_MULTIPLIERS[state.scope] *
    COMPLEXITY_MULTIPLIERS[state.complexity] *
    TIMELINE_MULTIPLIERS[state.timeline]
  );
}

export function formatUsdBasePrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
