"use client";

import { useEffect, useRef } from "react";
import type { EstimatorStepKey } from "@/lib/estimator-steps";
import {
  clearEstimatorSession,
  loadEstimatorSession,
  saveEstimatorSession,
} from "@/lib/estimator-session";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";

const DEBOUNCE_MS = 300;

export type EstimatorSessionSnapshot = {
  state: EstimatorState;
  currentStepKey: EstimatorStepKey;
  currency: CurrencyCode;
  contactLeadId: string | null;
  savedFingerprint: string | null;
};

export function useEstimatorSessionPersistence(
  snapshot: EstimatorSessionSnapshot,
  enabled: boolean,
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      saveEstimatorSession({
        state: snapshot.state,
        currentStepKey: snapshot.currentStepKey,
        currency: snapshot.currency,
        contactLeadId: snapshot.contactLeadId,
        savedFingerprint: snapshot.savedFingerprint,
        updatedAt: Date.now(),
      });
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, snapshot]);
}

export { clearEstimatorSession, loadEstimatorSession };
