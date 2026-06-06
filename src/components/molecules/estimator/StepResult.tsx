import { useMemo, useState, useTransition } from "react";
import { upsertEstimatorLead } from "@/actions/estimator-leads";
import { EstimatorSelectionRecap } from "@/components/molecules/estimator/EstimatorSelectionRecap";
import { EstimatorCurrencySelect } from "@/components/molecules/estimator/EstimatorCurrencySelect";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
import type { EstimatorState, CurrencyCode } from "@/types/estimator";
import { resolveBasePrice } from "@/types/estimator";
import { formatUsdAsCurrency } from "@/lib/estimator-format";
import type { ExchangeRates } from "@/hooks/useCurrencyRates";
import {
  BASE_PRICE_FLOOR_RATIO,
  calculateDeliverableSavings,
  getAdjustedBasePrice,
  getExcludedDeliverableLabels,
} from "@/lib/estimator-deliverables";
import { buildEstimatorFingerprint } from "@/lib/estimator-fingerprint";

interface StepResultProps {
  state: EstimatorState;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  budgetDisplay: string;
  rates: ExchangeRates | null;
  ratesLoading: boolean;
  ratesError: string | null;
  contactLeadId: string | null;
  savedFingerprint: string | null;
  onBack: () => void;
  onScheduleConsultation: (data: {
    leadId: string;
    budgetDisplay: string;
    currency: CurrencyCode;
    fingerprint: string;
  }) => void;
}

export function StepResult({
  state,
  currency,
  onCurrencyChange,
  budgetDisplay,
  rates,
  ratesLoading,
  ratesError,
  contactLeadId,
  savedFingerprint,
  onBack,
  onScheduleConsultation,
}: StepResultProps) {
  const [isSaving, startTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const packageSavings = useMemo(
    () => calculateDeliverableSavings(state),
    [state],
  );
  const excludedLabels = useMemo(
    () => getExcludedDeliverableLabels(state),
    [state],
  );
  const baseBeforeSavings = useMemo(() => resolveBasePrice(state), [state]);
  const adjustedBase = useMemo(() => getAdjustedBasePrice(state), [state]);
  const hitPriceFloor =
    baseBeforeSavings > 0 &&
    adjustedBase <= baseBeforeSavings * BASE_PRICE_FLOOR_RATIO + 1;

  const handleScheduleConsultation = () => {
    setSaveError(null);
    const fingerprint = buildEstimatorFingerprint(state, currency);

    if (contactLeadId && savedFingerprint === fingerprint) {
      onScheduleConsultation({
        leadId: contactLeadId,
        budgetDisplay,
        currency,
        fingerprint,
      });
      return;
    }

    startTransition(async () => {
      const result = await upsertEstimatorLead({
        leadId: contactLeadId,
        state,
        currency,
        budgetDisplay,
      });

      if (!result.ok) {
        setSaveError(result.error);
        return;
      }

      onScheduleConsultation({
        leadId: result.id,
        budgetDisplay,
        currency,
        fingerprint,
      });
    });
  };

  if (ratesLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center">
        <Loader2 className="text-accent h-8 w-8 animate-spin" />
        <p className="mt-4 text-sm text-zinc-500">
          Calculating your estimate...
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col text-center">
      <div className="mb-6">
        <div className="bg-accent/10 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full">
          <span className="text-3xl">✨</span>
        </div>
        <h2 className="text-3xl font-light text-zinc-900">
          Your Project Estimate
        </h2>
        <p className="mt-2 text-zinc-500">
          Based on your selections, here is the estimated cost.
        </p>
      </div>

      <EstimatorSelectionRecap
        state={state}
        budgetDisplay={budgetDisplay}
        currency={currency}
        variant="full"
      />

      <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 p-8 shadow-inner">
        <div className="mb-6 flex items-center gap-4">
          <span className="text-sm text-zinc-500">Currency:</span>
          <EstimatorCurrencySelect
            value={currency}
            onChange={onCurrencyChange}
          />
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-accent text-5xl font-bold tracking-tighter md:text-7xl">
            {budgetDisplay}
          </span>
        </div>

        {packageSavings > 0 && (
          <div className="mx-auto mt-4 max-w-md text-sm text-zinc-600">
            <p>
              Package savings:{" "}
              <span className="text-accent font-medium">
                −{formatUsdAsCurrency(packageSavings, currency, rates)}
              </span>
            </p>
            {excludedLabels.length > 0 && (
              <p className="mt-2 text-xs text-zinc-400">
                Removed: {excludedLabels.join(" · ")}
              </p>
            )}
            {hitPriceFloor && (
              <p className="mt-2 text-xs text-amber-700">
                Minimum package price applied (
                {Math.round(BASE_PRICE_FLOOR_RATIO * 100)}% of base).
              </p>
            )}
          </div>
        )}

        {ratesError && (
          <p className="mt-4 text-xs text-red-400">
            Note: Live exchange rates unavailable. Using default fallback rates.
          </p>
        )}

        <p className="mx-auto mt-4 max-w-sm text-sm text-zinc-500">
          This is a rough estimate. Final pricing may vary based on specific
          feature requirements, integrations, and design revisions.
        </p>
      </div>

      {saveError && (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-auto mb-6 flex max-w-lg items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-left text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">Could not save your estimate</p>
            <p className="mt-1">{saveError}</p>
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col-reverse justify-between gap-4 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="group relative inline-flex items-center justify-center gap-x-2 rounded-full border border-zinc-200 bg-transparent px-8 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span>Recalculate</span>
        </button>
        <button
          type="button"
          onClick={handleScheduleConsultation}
          disabled={isSaving}
          className="group relative inline-flex items-center justify-center gap-x-2 rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Schedule Consultation</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
