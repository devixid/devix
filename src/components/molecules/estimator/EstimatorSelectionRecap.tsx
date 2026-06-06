import { getExcludedDeliverableLabels } from "@/lib/estimator-deliverables";
import {
  formatComplexity,
  formatDesignApproachLabel,
  formatPlatform,
  formatProjectType,
  formatScope,
  formatTimeline,
} from "@/lib/estimator-labels";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";
import { supportsTemplateDesign } from "@/types/estimator";

interface EstimatorSelectionRecapProps {
  state: EstimatorState;
  budgetDisplay?: string;
  currency?: CurrencyCode;
  variant?: "compact" | "full";
  className?: string;
}

interface RecapRow {
  label: string;
  value: string;
}

function buildRows(
  state: EstimatorState,
  budgetDisplay?: string,
  currency?: CurrencyCode,
): RecapRow[] {
  const rows: RecapRow[] = [];

  if (state.type) {
    rows.push({
      label: "Project Type",
      value: formatProjectType(state.type),
    });
  }

  if (supportsTemplateDesign(state.type) && state.designApproach) {
    rows.push({
      label: "Design",
      value: formatDesignApproachLabel(state.designApproach),
    });
  }

  if (state.type === "mobile_app" && state.platform) {
    rows.push({
      label: "Platform",
      value: formatPlatform(state.platform),
    });
  }

  if (state.scope) {
    rows.push({
      label: "Scope",
      value: formatScope(state.scope, state.type),
    });
  }

  if (state.complexity) {
    rows.push({
      label: "Complexity",
      value: formatComplexity(state.complexity),
    });
  }

  if (state.timeline) {
    rows.push({
      label: "Timeline",
      value: formatTimeline(state.timeline),
    });
  }

  const excludedLabels = getExcludedDeliverableLabels(state);
  if (excludedLabels.length > 0) {
    rows.push({
      label: "Removed deliverables",
      value: excludedLabels.join(", "),
    });
  }

  if (budgetDisplay && currency) {
    rows.push({
      label: "Estimated budget",
      value: `${budgetDisplay} (${currency})`,
    });
  }

  return rows;
}

export function EstimatorSelectionRecap({
  state,
  budgetDisplay,
  currency,
  variant = "full",
  className = "",
}: EstimatorSelectionRecapProps) {
  const rows = buildRows(state, budgetDisplay, currency);

  if (rows.length === 0) return null;

  if (variant === "compact") {
    return (
      <div
        className={`rounded-xl border border-zinc-200 bg-white p-5 ${className}`}
      >
        <p className="mb-4 text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Your selections
        </p>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-sm text-zinc-500">{row.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-zinc-900">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto mb-6 max-w-lg rounded-xl border border-zinc-200 bg-white p-5 text-left ${className}`}
    >
      <p className="mb-4 text-xs font-medium tracking-wide text-zinc-500 uppercase">
        Your selections
      </p>
      <dl className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-sm text-zinc-500">{row.label}</dt>
            <dd className="mt-0.5 font-medium text-zinc-900">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
