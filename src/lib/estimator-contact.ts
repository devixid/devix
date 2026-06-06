import {
  COMPLEXITY_LABELS,
  DESIGN_LABELS,
  PLATFORM_LABELS,
  PROJECT_TYPE_LABELS,
  SCOPE_LABELS,
  SCOPE_LABELS_APP,
  TIMELINE_LABELS,
  formatScope,
} from "@/lib/estimator-labels";
import type {
  DesignApproach,
  PlatformType,
  ProjectComplexity,
  ProjectScope,
  ProjectTimeline,
  ProjectType,
} from "@/types/estimator";

function labelOrRaw<T extends string>(
  value: string | null | undefined,
  labels: Record<T, string>,
  fallback = "Not specified",
): string {
  if (!value || value === "Not specified") return fallback;
  if (value in labels) return labels[value as T];
  return value.replace(/_/g, " ");
}

function resolveScopeLabel(
  scope: ProjectScope | string | null,
  projectType?: ProjectType | string | null,
): string {
  if (!scope || scope === "Not specified") return "Not specified";

  if (
    projectType &&
    typeof projectType === "string" &&
    (projectType === "webapp" || projectType === "mobile_app") &&
    scope in SCOPE_LABELS_APP
  ) {
    return formatScope(scope as ProjectScope, projectType as ProjectType);
  }

  return labelOrRaw(scope, SCOPE_LABELS);
}

export function buildEstimatorContactMessage(params: {
  type: ProjectType | string | null;
  scope: ProjectScope | string | null;
  complexity: ProjectComplexity | string | null;
  timeline: ProjectTimeline | string | null;
  design?: DesignApproach | string | null;
  platform?: PlatformType | string | null;
  budget?: string;
  excludedLabels?: string[];
}): string {
  const {
    type,
    scope,
    complexity,
    timeline,
    design,
    platform,
    budget,
    excludedLabels = [],
  } = params;

  const typeLabel = labelOrRaw(type, PROJECT_TYPE_LABELS);
  const scopeLabel = resolveScopeLabel(scope, type);
  const complexityLabel = labelOrRaw(complexity, COMPLEXITY_LABELS);
  const timelineLabel = labelOrRaw(timeline, TIMELINE_LABELS);

  const designLine = design
    ? `\n- Design: ${labelOrRaw(design, DESIGN_LABELS, "")}`
    : "";

  const platformLine =
    platform && platform !== "Not specified"
      ? `\n- Platform: ${labelOrRaw(platform, PLATFORM_LABELS, "")}`
      : "";

  const excludedLine =
    excludedLabels.length > 0
      ? `\n- Removed deliverables: ${excludedLabels.join(", ")}`
      : "";

  return `Hi Devix Team,\n\nI would like to inquire about a new project based on my estimator results:\n\n- Project Type: ${typeLabel}\n- Scope: ${scopeLabel}\n- Complexity: ${complexityLabel}\n- Timeline: ${timelineLabel}${designLine}${platformLine}\n- Estimated Budget: ${budget || "Not specified"}${excludedLine}\n\nHere are some additional details about my project: `;
}
