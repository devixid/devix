"use client";

import { useMemo, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";
import { formatUsdAsCurrency } from "@/lib/estimator-format";
import type { ExchangeRates } from "@/hooks/useCurrencyRates";
import { EstimatorCheckbox } from "@/components/molecules/estimator/EstimatorCheckbox";
import {
  DELIVERABLE_DEPENDENCIES,
  MAX_DELIVERABLE_REMOVALS,
  calculateDeliverableSavings,
  countRemovalSlots,
  getProjectTypeDeliverables,
  getRemovableItems,
  resolveExcludedDeliverables,
} from "@/lib/estimator-deliverables";

interface StepCustomizeProps {
  state: EstimatorState;
  currency: CurrencyCode;
  rates: ExchangeRates | null;
  updateState: (updates: Partial<EstimatorState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const easeSmooth = [0.22, 1, 0.36, 1] as const;

export function StepCustomize({
  state,
  currency,
  rates,
  updateState,
  onNext,
  onBack,
}: StepCustomizeProps) {
  const [limitHint, setLimitHint] = useState(false);

  const projectType = state.type;
  const allItems = useMemo(
    () => (projectType ? getProjectTypeDeliverables(projectType) : []),
    [projectType],
  );
  const removableSorted = useMemo(
    () => (projectType ? getRemovableItems(projectType) : []),
    [projectType],
  );
  const requiredItems = useMemo(
    () => allItems.filter((item) => item.required),
    [allItems],
  );

  const resolvedExcluded = useMemo(
    () => resolveExcludedDeliverables(state.excludedDeliverableIds),
    [state.excludedDeliverableIds],
  );

  const savings = useMemo(() => calculateDeliverableSavings(state), [state]);

  const removalCount = countRemovalSlots(state.excludedDeliverableIds);

  if (!projectType) return null;

  const isDependentOnly = (id: string) => {
    for (const parentId of state.excludedDeliverableIds) {
      const deps = DELIVERABLE_DEPENDENCIES[parentId] ?? [];
      if (deps.includes(id)) return true;
    }
    return false;
  };

  const handleToggle = (id: string, shouldInclude: boolean) => {
    setLimitHint(false);

    if (shouldInclude) {
      const next = state.excludedDeliverableIds.filter(
        (itemId) => itemId !== id,
      );
      updateState({ excludedDeliverableIds: next });
      return;
    }

    const next = [...state.excludedDeliverableIds, id];
    if (countRemovalSlots(next) > MAX_DELIVERABLE_REMOVALS) {
      setLimitHint(true);
      return;
    }

    updateState({ excludedDeliverableIds: next });
  };

  const scale =
    state.designApproach === "template" &&
    (projectType === "company_profile" || projectType === "ecommerce")
      ? (projectType === "company_profile" ? 650 : 1600) /
        (projectType === "company_profile" ? 1200 : 2800)
      : 1;

  const formatDeduction = (deductionUsd: number) =>
    formatUsdAsCurrency(Math.round(deductionUsd * scale), currency, rates);

  const formatSavings = (amountUsd: number) =>
    formatUsdAsCurrency(amountUsd, currency, rates);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-light text-zinc-900">
          Customize your package
        </h2>
        <p className="mt-2 text-zinc-500">
          Uncheck up to {MAX_DELIVERABLE_REMOVALS} optional deliverables to
          reduce your estimate. Items are sorted from lowest to highest savings.
        </p>
      </div>

      <m.div
        layout
        className="bg-accent/5 border-accent/20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3"
      >
        <p className="text-sm text-zinc-700">
          <m.span
            key={removalCount}
            initial={{ scale: 1.2, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="text-accent inline-block font-medium"
          >
            {removalCount}
          </m.span>{" "}
          of {MAX_DELIVERABLE_REMOVALS} removals used
        </p>
        <p className="text-sm font-medium text-zinc-900">
          Package savings:{" "}
          <m.span
            key={savings}
            initial={{ y: 4, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.28, ease: easeSmooth }}
            className="text-accent inline-block"
          >
            {savings > 0 ? `−${formatSavings(savings)}` : formatSavings(0)}
          </m.span>
        </p>
      </m.div>

      <AnimatePresence>
        {limitHint && (
          <m.p
            role="alert"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.28, ease: easeSmooth }}
            className="overflow-hidden text-sm text-amber-700"
          >
            Maximum {MAX_DELIVERABLE_REMOVALS} removals reached. Re-include an
            item to remove a different one.
          </m.p>
        )}
      </AnimatePresence>

      <div className="mb-8 max-h-[min(50vh,420px)] space-y-6 overflow-y-auto pr-1">
        {requiredItems.length > 0 && (
          <div>
            <p className="mb-3 text-[11px] font-medium tracking-[0.15em] text-zinc-400 uppercase">
              Always included
            </p>
            <ul className="space-y-2">
              {requiredItems.map((item) => (
                <m.li
                  key={item.id}
                  layout
                  className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-white px-4 py-3"
                >
                  <EstimatorCheckbox
                    checked
                    locked
                    aria-label={`${item.label} (required)`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-800">{item.label}</p>
                    <span className="mt-1 inline-block text-[10px] font-medium tracking-wide text-zinc-400 uppercase">
                      Core
                    </span>
                  </div>
                </m.li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="mb-3 text-[11px] font-medium tracking-[0.15em] text-zinc-400 uppercase">
            Optional — uncheck to save
          </p>
          <ul className="space-y-2">
            {removableSorted.map((item) => {
              const included = !resolvedExcluded.includes(item.id);
              const dependent = isDependentOnly(item.id);

              return (
                <m.li
                  key={item.id}
                  layout
                  className="list-none"
                >
                  <m.div
                    role="button"
                    tabIndex={dependent ? -1 : 0}
                    initial={false}
                    animate={{
                      borderColor: included
                        ? "rgb(228 228 231)"
                        : "rgba(200, 169, 110, 0.45)",
                      backgroundColor: included
                        ? "rgb(255 255 255)"
                        : "rgba(200, 169, 110, 0.06)",
                    }}
                    transition={{ duration: 0.28, ease: easeSmooth }}
                    whileHover={
                      dependent
                        ? undefined
                        : { scale: 1.008, transition: { duration: 0.2 } }
                    }
                    whileTap={dependent ? undefined : { scale: 0.995 }}
                    onClick={() => {
                      if (!dependent) handleToggle(item.id, !included);
                    }}
                    onKeyDown={(e) => {
                      if (dependent) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleToggle(item.id, !included);
                      }
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-shadow duration-300 ${
                      dependent
                        ? "cursor-not-allowed opacity-80"
                        : "cursor-pointer hover:shadow-sm"
                    }`}
                  >
                    <EstimatorCheckbox
                      checked={included}
                      disabled={dependent}
                      onChange={(checked) => handleToggle(item.id, checked)}
                      aria-label={item.label}
                    />
                    <div className="min-w-0 flex-1">
                      <m.p
                        className="text-sm"
                        animate={{
                          color: included ? "#27272a" : "#71717a",
                        }}
                        transition={{ duration: 0.22 }}
                        style={{
                          textDecoration: included ? "none" : "line-through",
                        }}
                      >
                        {item.label}
                      </m.p>
                      <p className="mt-1 text-xs text-zinc-500">
                        Save {formatDeduction(item.deductionUsd)}
                        {dependent && (
                          <span className="text-zinc-400">
                            {" "}
                            · Included with payment removal
                          </span>
                        )}
                      </p>
                    </div>
                  </m.div>
                </m.li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="mt-auto flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="group relative inline-flex items-center gap-x-2 rounded-full border border-zinc-200 bg-transparent px-8 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span>Back</span>
        </button>
        <button
          type="button"
          onClick={onNext}
          className="group relative inline-flex items-center gap-x-2 rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-105 hover:bg-zinc-800 active:scale-95"
        >
          <span>See estimate</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
