"use client";

import { m, AnimatePresence } from "framer-motion";
import type { EstimatorStep, EstimatorStepKey } from "@/lib/estimator-steps";
import { getStepIndex } from "@/lib/estimator-steps";

interface EstimatorProgressProps {
  steps: EstimatorStep[];
  currentKey: EstimatorStepKey;
}

/** Connector from right edge of circle to left edge of next circle (h-8 = 1rem radius). */
const CONNECTOR_CLASS =
  "pointer-events-none absolute top-4 left-[calc(50%+1rem)] z-0 h-[2px] w-[calc(100%-2rem)] -translate-y-1/2 origin-left";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

export function EstimatorProgress({
  steps,
  currentKey,
}: EstimatorProgressProps) {
  const currentIndex = getStepIndex(steps, currentKey);
  const currentStep = steps[currentIndex];
  const progressPct =
    steps.length <= 1 ? 0 : (currentIndex / (steps.length - 1)) * 100;

  return (
    <div className="mb-8 md:mb-12">
      {/* Mobile: compact step indicator */}
      <div
        className="md:hidden"
        aria-live="polite"
      >
        <p className="text-[13px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
          Step {currentIndex + 1} of {steps.length}
        </p>
        <AnimatePresence mode="wait">
          <m.p
            key={currentKey}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: easeSmooth }}
            className="mt-1 text-base font-medium text-zinc-900"
          >
            {currentStep?.title}
          </m.p>
        </AnimatePresence>
        <div className="relative mt-4 h-[2px] w-full overflow-hidden rounded-full bg-zinc-200">
          <m.div
            className="bg-accent absolute top-0 left-0 h-[2px] rounded-full"
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.5, ease: easeSmooth }}
          />
        </div>
      </div>

      {/* Desktop: full stepper */}
      <div className="relative hidden w-full md:block">
        <div className="relative flex w-full">
          {steps.map((step, index) => {
            const isPast = index < currentIndex;
            const isCurrent = step.key === currentKey;
            const isReached = index <= currentIndex;
            const segmentComplete = index < currentIndex;

            return (
              <div
                key={step.key}
                className="relative flex min-w-0 flex-1 flex-col items-center gap-2"
              >
                {index < steps.length - 1 && (
                  <div
                    className={`${CONNECTOR_CLASS} bg-zinc-200`}
                    aria-hidden
                  />
                )}
                {index < steps.length - 1 && (
                  <m.div
                    className={`${CONNECTOR_CLASS} bg-accent`}
                    aria-hidden
                    initial={false}
                    animate={{ scaleX: segmentComplete ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: easeSmooth }}
                  />
                )}

                <m.div
                  className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white"
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Step ${index + 1}: ${step.title}`}
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.1 : 1,
                    borderColor: isCurrent || isPast ? "#C8A96E" : "#e4e4e7",
                    color: isReached ? "#C8A96E" : "#a1a1aa",
                    boxShadow: isCurrent
                      ? "0 0 0 3px rgba(200, 169, 110, 0.28)"
                      : "0 0 0 0px rgba(200, 169, 110, 0)",
                  }}
                  transition={{
                    scale: { type: "spring", stiffness: 420, damping: 22 },
                    borderColor: { duration: 0.35, ease: easeSmooth },
                    color: { duration: 0.35, ease: easeSmooth },
                    boxShadow: { duration: 0.35, ease: easeSmooth },
                  }}
                >
                  <m.span
                    className="text-sm"
                    animate={{
                      fontWeight: isCurrent ? 600 : 500,
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    {index + 1}
                  </m.span>
                </m.div>

                <m.span
                  className="relative z-10 max-w-full px-0.5 text-center text-xs leading-tight"
                  initial={false}
                  animate={{
                    color: isReached ? "#27272a" : "#a1a1aa",
                    y: isCurrent ? 0 : 0,
                  }}
                  transition={{ duration: 0.35, ease: easeSmooth }}
                >
                  {step.title}
                </m.span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
