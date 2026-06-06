"use client";

import { DropdownSelect } from "@/components/molecules/DropdownSelect";
import { CURRENCIES } from "@/lib/estimator-format";
import type { CurrencyCode } from "@/types/estimator";

interface EstimatorCurrencySelectProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  compact?: boolean;
  className?: string;
}

export function EstimatorCurrencySelect({
  value,
  onChange,
  compact = false,
  className = "",
}: EstimatorCurrencySelectProps) {
  return (
    <DropdownSelect
      value={value}
      onChange={onChange}
      variant="light"
      compact={compact}
      className={className}
      options={CURRENCIES.map((currency) => ({
        value: currency.code,
        label: currency.code,
        description: currency.name,
      }))}
    />
  );
}
