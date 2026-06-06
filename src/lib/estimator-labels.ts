import type {
  DesignApproach,
  PlatformType,
  ProjectComplexity,
  ProjectScope,
  ProjectTimeline,
  ProjectType,
} from "@/types/estimator";

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  company_profile: "Company Profile",
  ecommerce: "E-Commerce",
  webapp: "Custom Web App",
  mobile_app: "Mobile App",
};

export const DESIGN_LABELS: Record<DesignApproach, string> = {
  template: "Template Design",
  custom: "Custom Design",
};

export const PLATFORM_LABELS: Record<PlatformType, string> = {
  android: "Android Only",
  ios: "iOS Only",
  both: "Both Platforms",
};

export const SCOPE_LABELS: Record<ProjectScope, string> = {
  small: "1 - 5 Pages",
  medium: "5 - 15 Pages",
  large: "15+ Pages",
};

export const SCOPE_LABELS_APP: Record<ProjectScope, string> = {
  small: "3 - 5 Core Screens",
  medium: "6 - 12 Screens",
  large: "13+ Screens",
};

export const COMPLEXITY_LABELS: Record<ProjectComplexity, string> = {
  basic: "Basic",
  standard: "Standard",
  premium: "Premium",
};

export const TIMELINE_LABELS: Record<ProjectTimeline, string> = {
  relaxed: "Relaxed (8+ weeks)",
  standard: "Standard (4-8 weeks)",
  rush: "Rush (<4 weeks)",
};

export type ScopeCopy = {
  label: string;
  description: string;
  heading: string;
  subheading: string;
};

export type ScopeOptionConfig = {
  id: ProjectScope;
  label: string;
  description: string;
};

function isAppType(type: ProjectType | null): boolean {
  return type === "webapp" || type === "mobile_app";
}

function scopeLabelsForType(type: ProjectType | null) {
  return isAppType(type) ? SCOPE_LABELS_APP : SCOPE_LABELS;
}

export function getScopeHeading(type: ProjectType | null): string {
  return isAppType(type)
    ? "How extensive is the app?"
    : "How large is your project?";
}

export function getScopeSubheading(type: ProjectType | null): string {
  return isAppType(type)
    ? "Estimate the number of core screens and user flows required."
    : "Estimate the number of unique pages or views required.";
}

const SCOPE_DESCRIPTIONS_WEBSITE: Record<ProjectScope, string> = {
  small:
    "Perfect for startups and small businesses needing an online presence.",
  medium:
    "Ideal for growing companies with multiple services or product lines.",
  large:
    "For large organizations requiring comprehensive content management.",
};

const SCOPE_DESCRIPTIONS_APP: Record<ProjectScope, string> = {
  small:
    "A focused MVP with essential screens and a single primary user journey.",
  medium:
    "Multiple modules, roles, or feature areas with moderate complexity.",
  large:
    "A full-featured product with many screens, flows, and integrations.",
};

export function getScopeOptions(
  type: ProjectType | null,
): ScopeOptionConfig[] {
  const labels = scopeLabelsForType(type);
  const descriptions = isAppType(type)
    ? SCOPE_DESCRIPTIONS_APP
    : SCOPE_DESCRIPTIONS_WEBSITE;

  return (["small", "medium", "large"] as ProjectScope[]).map((id) => ({
    id,
    label: labels[id],
    description: descriptions[id],
  }));
}

export function getScopeCopy(
  type: ProjectType | null,
  scope: ProjectScope,
): ScopeCopy {
  const labels = scopeLabelsForType(type);
  const descriptions = isAppType(type)
    ? SCOPE_DESCRIPTIONS_APP
    : SCOPE_DESCRIPTIONS_WEBSITE;

  return {
    label: labels[scope],
    description: descriptions[scope],
    heading: getScopeHeading(type),
    subheading: getScopeSubheading(type),
  };
}

export function formatProjectType(
  type: ProjectType | null | undefined,
): string {
  if (!type) return "—";
  return PROJECT_TYPE_LABELS[type];
}

export function formatDesignApproachLabel(
  approach: DesignApproach | null | undefined,
): string {
  if (!approach) return "—";
  return DESIGN_LABELS[approach];
}

export function formatPlatform(
  platform: PlatformType | null | undefined,
): string {
  if (!platform) return "—";
  return PLATFORM_LABELS[platform];
}

export function formatScope(
  scope: ProjectScope | null | undefined,
  type?: ProjectType | null,
): string {
  if (!scope) return "—";
  return scopeLabelsForType(type ?? null)[scope];
}

export function formatComplexity(
  complexity: ProjectComplexity | null | undefined,
): string {
  if (!complexity) return "—";
  return COMPLEXITY_LABELS[complexity];
}

export function formatTimeline(
  timeline: ProjectTimeline | null | undefined,
): string {
  if (!timeline) return "—";
  return TIMELINE_LABELS[timeline];
}
