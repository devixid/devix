"use client";

import { useState, useEffect, useMemo } from "react";
import { AnimatePresence } from "framer-motion";
import {
  StepType,
  StepDesign,
  StepPlatform,
  StepScope,
  StepComplexity,
  StepTimeline,
  StepCustomize,
  StepResult,
  StepContact,
} from "./estimator-steps-dynamic";
import { EstimatorProgress } from "@/components/molecules/estimator/EstimatorProgress";
import { EstimatorLiveSummary } from "@/components/molecules/estimator/EstimatorLiveSummary";
import { EstimatorStepTransition } from "@/components/molecules/estimator/EstimatorStepTransition";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";
import { detectDefaultCurrency } from "@/lib/estimator-format";
import { useCurrencyRates } from "@/hooks/useCurrencyRates";
import { useEstimatorPricing } from "@/hooks/useEstimatorPricing";
import {
  clearEstimatorSession,
  loadEstimatorSession,
  useEstimatorSessionPersistence,
} from "@/hooks/useEstimatorSession";
import {
  buildEstimatorSteps,
  clampStepKey,
  getNextStepKey,
  getPrevStepKey,
  type EstimatorStepKey,
} from "@/lib/estimator-steps";

const INITIAL_STATE: EstimatorState = {
  type: null,
  designApproach: null,
  platform: null,
  scope: null,
  complexity: null,
  timeline: null,
  excludedDeliverableIds: [],
};

export default function ProjectEstimator() {
  const {
    rates,
    isLoading: ratesLoading,
    error: ratesError,
  } = useCurrencyRates();

  const [hydrated, setHydrated] = useState(false);
  const [showRestoredBanner, setShowRestoredBanner] = useState(false);
  const [currentStepKey, setCurrentStepKey] =
    useState<EstimatorStepKey>("type");
  const [slideDirection, setSlideDirection] = useState(1);
  const [contactLeadId, setContactLeadId] = useState<string | null>(null);
  const [savedFingerprint, setSavedFingerprint] = useState<string | null>(null);
  const [contactBudgetDisplay, setContactBudgetDisplay] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [state, setState] = useState<EstimatorState>(INITIAL_STATE);
  const [contactSuccess, setContactSuccess] = useState(false);

  const steps = buildEstimatorSteps(state);

  const { canEstimate, budgetDisplay } = useEstimatorPricing(
    state,
    rates,
    currency,
  );

  const sessionSnapshot = useMemo(
    () => ({
      state,
      currentStepKey,
      currency,
      contactLeadId,
      savedFingerprint,
    }),
    [state, currentStepKey, currency, contactLeadId, savedFingerprint],
  );

  useEstimatorSessionPersistence(sessionSnapshot, hydrated && !contactSuccess);

  useEffect(() => {
    const session = loadEstimatorSession();
    if (session) {
      setState(session.state);
      setCurrentStepKey(clampStepKey(session.currentStepKey, session.state));
      setCurrency(session.currency);
      setContactLeadId(session.contactLeadId);
      setSavedFingerprint(session.savedFingerprint);
      setShowRestoredBanner(true);
    } else {
      setCurrency(detectDefaultCurrency());
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    setCurrentStepKey((key) => clampStepKey(key, state));
  }, [state, state.type]);

  const updateState = (updates: Partial<EstimatorState>) => {
    if (updates.type !== undefined) {
      setSlideDirection(-1);
      setCurrentStepKey("type");
      setContactLeadId(null);
      setSavedFingerprint(null);
      setContactSuccess(false);
    }

    setState((prev) => {
      const next = { ...prev, ...updates };
      if (updates.type) {
        if (updates.type !== "mobile_app") {
          next.platform = null;
        }
        next.designApproach = null;
        next.excludedDeliverableIds = [];
      }
      return next;
    });
  };

  const handleScheduleConsultation = (data: {
    leadId: string;
    budgetDisplay: string;
    currency: CurrencyCode;
    fingerprint: string;
  }) => {
    setContactLeadId(data.leadId);
    setContactBudgetDisplay(data.budgetDisplay);
    setCurrency(data.currency);
    setSavedFingerprint(data.fingerprint);
    setSlideDirection(1);
    setCurrentStepKey("contact");
  };

  const handleContactSuccess = () => {
    setContactSuccess(true);
    clearEstimatorSession();
    setContactLeadId(null);
    setSavedFingerprint(null);
  };

  const handleAdjustEstimate = () => {
    setContactSuccess(false);
    setSlideDirection(-1);
    setCurrentStepKey("result");
  };

  const nextStep = () => {
    setSlideDirection(1);
    setCurrentStepKey((key) => getNextStepKey(key, state) ?? key);
  };

  const prevStep = () => {
    setSlideDirection(-1);
    setCurrentStepKey((key) => getPrevStepKey(key, state) ?? key);
  };

  const transitionVariant = currentStepKey === "result" ? "reveal" : "slide";

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-20 lg:px-10">
        <div className="flex min-h-[200px] items-center justify-center text-sm text-zinc-400">
          Loading estimator…
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12 md:py-20 lg:px-10">
      <div className="mb-12 text-center">
        <p className="mb-4 text-[13px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
          Pricing Calculator
        </p>
        <h1 className="text-4xl font-extralight text-zinc-900 md:text-5xl">
          Interactive Project Estimator.
        </h1>
        <p className="mt-4 text-zinc-500">
          Answer a few questions to get an instant cost estimation for your
          project.
        </p>
      </div>

      {showRestoredBanner && (
        <div
          role="status"
          className="border-accent/25 bg-accent/5 mb-6 flex items-center justify-between gap-4 rounded-xl border px-4 py-3 text-sm text-zinc-700"
        >
          <span>We&apos;ve restored your progress from this session.</span>
          <button
            type="button"
            onClick={() => setShowRestoredBanner(false)}
            className="shrink-0 text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-800 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <EstimatorProgress
        steps={steps}
        currentKey={currentStepKey}
      />

      <EstimatorLiveSummary
        state={state}
        currentStepKey={currentStepKey}
        currency={currency}
        onCurrencyChange={setCurrency}
        ratesLoading={ratesLoading}
        ratesError={ratesError}
        canEstimate={canEstimate}
        budgetDisplay={budgetDisplay}
      />

      <div className="relative min-h-[400px] overflow-x-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-6 backdrop-blur-sm md:p-10">
        <AnimatePresence
          mode="wait"
          initial={false}
        >
          <EstimatorStepTransition
            key={currentStepKey}
            stepKey={currentStepKey}
            direction={slideDirection}
            variant={transitionVariant}
          >
            {currentStepKey === "type" && (
              <StepType
                state={state}
                currency={currency}
                rates={rates}
                updateState={updateState}
                onNext={nextStep}
              />
            )}
            {currentStepKey === "design" && (
              <StepDesign
                state={state}
                currency={currency}
                rates={rates}
                updateState={updateState}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStepKey === "platform" && (
              <StepPlatform
                state={state}
                updateState={updateState}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStepKey === "scope" && (
              <StepScope
                state={state}
                updateState={updateState}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStepKey === "complexity" && (
              <StepComplexity
                state={state}
                updateState={updateState}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStepKey === "timeline" && (
              <StepTimeline
                state={state}
                updateState={updateState}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStepKey === "customize" && (
              <StepCustomize
                state={state}
                currency={currency}
                rates={rates}
                updateState={updateState}
                onNext={nextStep}
                onBack={prevStep}
              />
            )}
            {currentStepKey === "result" && (
              <StepResult
                state={state}
                currency={currency}
                onCurrencyChange={setCurrency}
                budgetDisplay={budgetDisplay}
                rates={rates}
                ratesLoading={ratesLoading}
                ratesError={ratesError}
                contactLeadId={contactLeadId}
                savedFingerprint={savedFingerprint}
                onBack={prevStep}
                onScheduleConsultation={handleScheduleConsultation}
              />
            )}
            {currentStepKey === "contact" && (
              <StepContact
                state={state}
                budgetDisplay={contactBudgetDisplay || budgetDisplay}
                currency={currency}
                leadId={contactLeadId}
                contactSuccess={contactSuccess}
                onBack={prevStep}
                onContactSuccess={handleContactSuccess}
                onAdjustEstimate={handleAdjustEstimate}
              />
            )}
          </EstimatorStepTransition>
        </AnimatePresence>
      </div>
    </div>
  );
}
