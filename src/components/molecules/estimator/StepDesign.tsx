import type {
  CurrencyCode,
  DesignApproach,
  EstimatorState,
} from "@/types/estimator";
import { formatUsdAsCurrency } from "@/lib/estimator-format";
import type { ExchangeRates } from "@/hooks/useCurrencyRates";
import {
  BASE_PRICES,
  TEMPLATE_BASE_PRICES,
  supportsTemplateDesign,
} from "@/types/estimator";
import { DESIGN_LABELS } from "@/lib/estimator-labels";
import { getDesignDeliverables } from "@/lib/estimator-deliverables";
import { EstimatorTierCard } from "./EstimatorTierCard";
import { LayoutTemplate, Palette } from "lucide-react";
import type { ReactNode } from "react";

interface StepDesignProps {
  state: EstimatorState;
  currency: CurrencyCode;
  rates: ExchangeRates | null;
  updateState: (updates: Partial<EstimatorState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DESIGN_OPTIONS: {
  id: DesignApproach;
  label: string;
  icon: ReactNode;
  description: string;
  badge?: string;
}[] = [
  {
    id: "template",
    label: DESIGN_LABELS.template,
    icon: <LayoutTemplate className="h-8 w-8" />,
    description:
      "Start from a proven layout and customize it with your brand, content, and colors. Faster delivery at a lower cost.",
    badge: "Best value",
  },
  {
    id: "custom",
    label: DESIGN_LABELS.custom,
    icon: <Palette className="h-8 w-8" />,
    description:
      "A fully bespoke interface designed from scratch for a unique brand experience and tailored user journey.",
  },
];

export function StepDesign({
  state,
  currency,
  rates,
  updateState,
  onNext,
  onBack,
}: StepDesignProps) {
  const projectType = state.type;

  if (!supportsTemplateDesign(projectType)) {
    return null;
  }

  const getFromPrice = (approach: DesignApproach) =>
    formatUsdAsCurrency(
      approach === "template"
        ? TEMPLATE_BASE_PRICES[projectType]
        : BASE_PRICES[projectType],
      currency,
      rates,
    );

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900">
          How should we approach the design?
        </h2>
        <p className="mt-2 text-zinc-500">
          Template design is available for{" "}
          {projectType === "company_profile" ? "company profile" : "e-commerce"}{" "}
          projects and can significantly reduce your estimate.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {DESIGN_OPTIONS.map((option) => (
          <EstimatorTierCard
            key={option.id}
            isSelected={state.designApproach === option.id}
            onSelect={() => updateState({ designApproach: option.id })}
            icon={option.icon}
            label={option.label}
            description={option.description}
            badge={option.badge}
            detail={getDesignDeliverables(option.id, projectType)}
            priceLabel={<>From {getFromPrice(option.id)}</>}
          />
        ))}
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
          disabled={!state.designApproach}
          className="group relative inline-flex items-center gap-x-2 rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-105 hover:bg-zinc-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Continue</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
