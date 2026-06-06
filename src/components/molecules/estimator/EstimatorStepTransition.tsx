"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import type { EstimatorStepKey } from "@/lib/estimator-steps";

const easeSmooth = [0.22, 1, 0.36, 1] as const;
const SLIDE_OFFSET = 32;

interface EstimatorStepTransitionProps {
  stepKey: EstimatorStepKey;
  direction: number;
  variant?: "slide" | "reveal";
  children: ReactNode;
}

export function EstimatorStepTransition({
  stepKey,
  direction,
  variant = "slide",
  children,
}: EstimatorStepTransitionProps) {
  if (variant === "reveal") {
    return (
      <m.div
        key={stepKey}
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: -8 }}
        transition={{ duration: 0.42, ease: easeSmooth }}
      >
        {children}
      </m.div>
    );
  }

  const offset = direction >= 0 ? SLIDE_OFFSET : -SLIDE_OFFSET;

  return (
    <m.div
      key={stepKey}
      initial={{ opacity: 0, x: offset }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -offset }}
      transition={{ duration: 0.38, ease: easeSmooth }}
    >
      {children}
    </m.div>
  );
}
