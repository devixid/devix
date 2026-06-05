"use client";

import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { StepType } from "../../molecules/estimator/StepType";
import { StepResult } from "../../molecules/estimator/StepResult";
import type { EstimatorState } from "@/types/estimator";
import { StepScope } from "@/components/molecules/estimator/StepScope";
import { StepComplexity } from "@/components/molecules/estimator/StepComplexity";
import { StepTimeline } from "@/components/molecules/estimator/StepTimeline";
import { StepPlatform } from "../../molecules/estimator/StepPlatform";

export default function ProjectEstimator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState<EstimatorState>({
    type: null,
    scope: null,
    complexity: null,
    timeline: null,
  });

  const updateState = (updates: Partial<EstimatorState>) => {
    setState((prev) => {
      const next = { ...prev, ...updates };
      if (updates.type && updates.type !== "mobile_app") {
        next.platform = null;
      }
      return next;
    });
  };

  const steps = [
    { key: "type", title: "Project Type" },
    ...(state.type === "mobile_app" ? [{ key: "platform", title: "Platform" }] : []),
    { key: "scope", title: "Scope" },
    { key: "complexity", title: "Complexity" },
    { key: "timeline", title: "Timeline" },
    { key: "result", title: "Estimation" },
  ].map((step, idx) => ({ ...step, id: idx + 1 }));

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const currentStepKey = steps[currentStep - 1]?.key;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
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

      {/* Progress Bar */}
      <div className="mb-12">
        <div className="relative flex justify-between">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 h-[2px] w-full -translate-y-1/2 bg-zinc-200" />
          <div
            className="bg-accent absolute top-1/2 left-0 h-[2px] -translate-y-1/2 transition-all duration-500 ease-in-out"
            style={{
              width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
            }}
          />

          {steps.map((step) => (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                  currentStep >= step.id
                    ? "border-accent bg-accent text-white"
                    : "border-zinc-200 bg-white text-zinc-400"
                }`}
              >
                <span className="text-sm font-medium">{step.id}</span>
              </div>
              <span
                className={`hidden text-xs transition-colors duration-300 md:block ${
                  currentStep >= step.id ? "text-zinc-800" : "text-zinc-400"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content Wrapper */}
      <div className="relative min-h-[400px] overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-6 backdrop-blur-sm md:p-10">
        <AnimatePresence mode="wait">
          {currentStepKey === "type" && (
            <m.div
              key="step-type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepType
                state={state}
                updateState={updateState}
                onNext={nextStep}
              />
            </m.div>
          )}
          {currentStepKey === "platform" && (
            <m.div
              key="step-platform"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepPlatform
                state={state}
                updateState={updateState}
                onNext={nextStep}
                onBack={prevStep}
              />
            </m.div>
          )}
          {currentStepKey === "scope" && (
            <m.div
              key="step-scope"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepScope
                state={state}
                updateState={updateState}
                onNext={nextStep}
                onBack={prevStep}
              />
            </m.div>
          )}
          {currentStepKey === "complexity" && (
            <m.div
              key="step-complexity"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepComplexity
                state={state}
                updateState={updateState}
                onNext={nextStep}
                onBack={prevStep}
              />
            </m.div>
          )}
          {currentStepKey === "timeline" && (
            <m.div
              key="step-timeline"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <StepTimeline
                state={state}
                updateState={updateState}
                onNext={nextStep}
                onBack={prevStep}
              />
            </m.div>
          )}
          {currentStepKey === "result" && (
            <m.div
              key="step-result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <StepResult
                state={state}
                onBack={prevStep}
              />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
