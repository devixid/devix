import { useMemo, useCallback } from "react";
import type { ExchangeRates } from "@/hooks/useCurrencyRates";
import { formatEstimatePrice } from "@/lib/estimator-format";
import type { CurrencyCode, EstimatorState } from "@/types/estimator";
import { calculateEstimateUsd } from "@/types/estimator";

export function useEstimatorPricing(
  state: EstimatorState,
  rates: ExchangeRates | null,
  currency: CurrencyCode,
) {
  const estimateUsd = useMemo(() => calculateEstimateUsd(state), [state]);
  const canEstimate = estimateUsd > 0;

  const localAmount = useMemo(() => {
    if (!canEstimate) return 0;
    const rate = rates?.[currency] ?? 1;
    return estimateUsd * rate;
  }, [canEstimate, estimateUsd, rates, currency]);

  const budgetDisplay = useMemo(() => {
    if (!canEstimate) return "";
    return formatEstimatePrice(localAmount, currency);
  }, [canEstimate, localAmount, currency]);

  const formatPrice = useCallback(
    (price: number, code: CurrencyCode = currency) =>
      formatEstimatePrice(price, code),
    [currency],
  );

  return {
    estimateUsd,
    canEstimate,
    localAmount,
    budgetDisplay,
    formatPrice,
  };
}
