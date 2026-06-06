"use client";

import { m, AnimatePresence } from "framer-motion";
import type { EstimatorStepKey } from "@/lib/estimator-steps";
import {
  formatDesignApproachLabel,
  formatPlatform,
  formatProjectType,
  formatScope,
} from "@/lib/estimator-labels";
import { EstimatorCurrencySelect } from "@/components/molecules/estimator/EstimatorCurrencySelect";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";
import { supportsTemplateDesign } from "@/types/estimator";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

interface EstimatorLiveSummaryProps {
  state: EstimatorState;
  currentStepKey: EstimatorStepKey;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  ratesLoading: boolean;
  ratesError: string | null;
  canEstimate: boolean;
  budgetDisplay: string;
}

function buildChips(state: EstimatorState): string[] {
  const chips: string[] = [];
  if (state.type) chips.push(formatProjectType(state.type));
  if (supportsTemplateDesign(state.type) && state.designApproach) {
    chips.push(formatDesignApproachLabel(state.designApproach));
  }
  if (state.type === "mobile_app" && state.platform) {
    chips.push(formatPlatform(state.platform));
  }
  if (state.scope) chips.push(formatScope(state.scope, state.type));
  return chips.slice(0, 3);
}

export function EstimatorLiveSummary({
  state,
  currentStepKey,
  currency,
  onCurrencyChange,
  ratesLoading,
  ratesError,
  canEstimate,
  budgetDisplay,
}: EstimatorLiveSummaryProps) {
  if (currentStepKey === "contact") return null;

  const chips = buildChips(state);

  return (
    <m.div
      layout
      className="mb-6 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <AnimatePresence mode="popLayout">
          {chips.length === 0 ? (
            <m.span
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-zinc-400"
            >
              Select options to build your estimate
            </m.span>
          ) : (
            chips.map((chip) => (
              <m.span
                key={chip}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.22, ease: easeSmooth }}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700"
              >
                {chip}
              </m.span>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:justify-end">
        <EstimatorCurrencySelect
          value={currency}
          onChange={onCurrencyChange}
          compact
        />
        <div
          className="text-right"
          aria-live="polite"
        >
          {ratesLoading ? (
            <span className="text-sm text-zinc-400">Loading rates…</span>
          ) : canEstimate ? (
            <m.span
              key={budgetDisplay}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: easeSmooth }}
              className="text-accent text-lg font-semibold tracking-tight sm:text-xl"
            >
              {budgetDisplay}
            </m.span>
          ) : (
            <span className="max-w-[10rem] text-sm text-zinc-400 sm:max-w-none">
              Complete steps to see estimate
            </span>
          )}
        </div>
      </div>

      {ratesError && (
        <p className="w-full text-xs text-amber-700 sm:col-span-2">
          Live exchange rates unavailable. Using fallback rates.
        </p>
      )}
    </m.div>
  );
}
