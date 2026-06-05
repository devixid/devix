export type ProjectType = "company_profile" | "ecommerce" | "webapp" | "mobile_app";
export type PlatformType = "android" | "ios" | "both";
export type ProjectScope = "small" | "medium" | "large";
export type ProjectComplexity = "basic" | "standard" | "premium";
export type ProjectTimeline = "relaxed" | "standard" | "rush";

export type CurrencyCode = "USD" | "IDR" | "MYR" | "SGD" | "BND" | "PHP" | "THB";

export interface EstimatorState {
  type: ProjectType | null;
  platform: PlatformType | null;
  scope: ProjectScope | null;
  complexity: ProjectComplexity | null;
  timeline: ProjectTimeline | null;
}

export const BASE_PRICES: Record<ProjectType, number> = {
  company_profile: 1500,
  ecommerce: 3000,
  webapp: 5000,
  mobile_app: 6000,
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
