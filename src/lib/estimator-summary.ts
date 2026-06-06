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
  CurrencyCode,
  EstimatorState,
  ProjectScope,
  ProjectType,
} from "@/types/estimator";

export type EstimatorSummaryLine = {
  label: string;
  value: string;
};

export type EstimatorSummary = {
  title: string;
  generatedAt: string;
  lines: EstimatorSummaryLine[];
  budgetDisplay: string;
  currency: CurrencyCode;
  excludedLabels: string[];
  packageSavingsUsd: number | null;
  ratesFallback: boolean;
  disclaimer: string;
};

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

export function buildEstimatorSummaryLines(options: {
  state: EstimatorState;
  budgetDisplay: string;
  currency: CurrencyCode;
  excludedLabels?: string[];
  packageSavings?: number;
  ratesError?: string | null;
}): EstimatorSummary {
  const {
    state,
    budgetDisplay,
    currency,
    excludedLabels = [],
    packageSavings = 0,
    ratesError,
  } = options;

  const lines: EstimatorSummaryLine[] = [
    {
      label: "Project Type",
      value: labelOrRaw(state.type, PROJECT_TYPE_LABELS),
    },
  ];

  if (state.designApproach) {
    lines.push({
      label: "Design",
      value: labelOrRaw(state.designApproach, DESIGN_LABELS),
    });
  }

  if (state.platform) {
    lines.push({
      label: "Platform",
      value: labelOrRaw(state.platform, PLATFORM_LABELS),
    });
  }

  lines.push(
    {
      label: "Scope",
      value: resolveScopeLabel(state.scope, state.type),
    },
    {
      label: "Complexity",
      value: labelOrRaw(state.complexity, COMPLEXITY_LABELS),
    },
    {
      label: "Timeline",
      value: labelOrRaw(state.timeline, TIMELINE_LABELS),
    },
  );

  const disclaimer =
    "This is an indicative estimate only. Final pricing may vary based on specific feature requirements, integrations, and design revisions. This document is not a binding quote.";

  return {
    title: "Devix — Project Estimate",
    generatedAt: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    lines,
    budgetDisplay,
    currency,
    excludedLabels,
    packageSavingsUsd: packageSavings > 0 ? packageSavings : null,
    ratesFallback: Boolean(ratesError),
    disclaimer,
  };
}

export function buildEstimatorSummaryText(summary: EstimatorSummary): string {
  const sections = [
    summary.title,
    `Generated: ${summary.generatedAt}`,
    "",
    ...summary.lines.map((line) => `${line.label}: ${line.value}`),
    "",
    `Estimated Budget (${summary.currency}): ${summary.budgetDisplay}`,
  ];

  if (summary.packageSavingsUsd) {
    sections.push(
      `Package savings (USD): $${summary.packageSavingsUsd.toLocaleString()}`,
    );
  }

  if (summary.excludedLabels.length > 0) {
    sections.push(`Removed deliverables: ${summary.excludedLabels.join(", ")}`);
  }

  if (summary.ratesFallback) {
    sections.push(
      "Note: Live exchange rates were unavailable when this estimate was generated.",
    );
  }

  sections.push("", summary.disclaimer);

  return sections.join("\n");
}
