"use client";

import { ContactForm } from "@/components/molecules/ContactForm";
import { buildEstimatorContactMessage } from "@/lib/estimator-contact";
import { EstimatorSelectionRecap } from "@/components/molecules/estimator/EstimatorSelectionRecap";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";
import { getExcludedDeliverableLabels } from "@/lib/estimator-deliverables";

interface StepContactProps {
  state: EstimatorState;
  budgetDisplay: string;
  currency: CurrencyCode;
  leadId: string | null;
  contactSuccess: boolean;
  onBack: () => void;
  onContactSuccess: () => void;
  onAdjustEstimate: () => void;
}

export function StepContact({
  state,
  budgetDisplay,
  currency,
  leadId,
  contactSuccess,
  onBack,
  onContactSuccess,
  onAdjustEstimate,
}: StepContactProps) {
  const excludedLabels = getExcludedDeliverableLabels(state);

  const initialMessage = buildEstimatorContactMessage({
    type: state.type,
    scope: state.scope,
    complexity: state.complexity,
    timeline: state.timeline,
    design: state.designApproach,
    platform: state.platform,
    budget: budgetDisplay,
    excludedLabels,
  });

  return (
    <div className="flex h-full w-full flex-col">
      {!contactSuccess && (
        <div className="mb-8 w-full text-left">
          <p className="mb-3 text-[13px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
            Get in Touch
          </p>
          <h2 className="text-2xl font-light text-zinc-900 md:text-3xl">
            Schedule your consultation
          </h2>
          <p className="mt-2 text-zinc-500">
            Share your details and we&apos;ll follow up within 24 hours. You can go
            back anytime to adjust your estimate.
          </p>
          <div className="mt-6 w-full">
            <EstimatorSelectionRecap
              state={state}
              budgetDisplay={budgetDisplay}
              currency={currency}
              variant="compact"
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="mb-8 w-full">
        <ContactForm
          initialMessage={initialMessage}
          estimatorLeadId={leadId}
          fillFromUrlParams={false}
          variant="estimator"
          onEstimatorSuccess={onAdjustEstimate}
          onSuccess={onContactSuccess}
          className="min-h-0 w-full"
        />
      </div>

      {!contactSuccess && (
        <div className="mt-auto flex justify-start">
          <button
            type="button"
            onClick={onBack}
            className="group relative inline-flex items-center gap-x-2 rounded-full border border-zinc-200 bg-transparent px-8 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            <span>Back to estimate</span>
          </button>
        </div>
      )}
    </div>
  );
}
