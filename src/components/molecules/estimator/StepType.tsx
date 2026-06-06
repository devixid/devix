import type {
  CurrencyCode,
  EstimatorState,
  ProjectType,
} from "@/types/estimator";
import { PROJECT_TYPE_LABELS } from "@/lib/estimator-labels";
import { formatUsdAsCurrency } from "@/lib/estimator-format";
import type { ExchangeRates } from "@/hooks/useCurrencyRates";
import {
  BASE_PRICES,
  getLowestBasePrice,
  supportsTemplateDesign,
} from "@/types/estimator";
import { PROJECT_TYPE_DELIVERABLES } from "@/lib/estimator-deliverables";
import { EstimatorTierCard } from "./EstimatorTierCard";
import { Monitor, ShoppingCart, Briefcase, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

interface StepTypeProps {
  state: EstimatorState;
  currency: CurrencyCode;
  rates: ExchangeRates | null;
  updateState: (updates: Partial<EstimatorState>) => void;
  onNext: () => void;
}

const PROJECT_TYPES: {
  id: ProjectType;
  label: string;
  icon: ReactNode;
  description: string;
}[] = [
  {
    id: "company_profile",
    label: PROJECT_TYPE_LABELS.company_profile,
    icon: <Briefcase className="h-8 w-8" />,
    description:
      "A professional site to showcase your brand, services, and team.",
  },
  {
    id: "ecommerce",
    label: PROJECT_TYPE_LABELS.ecommerce,
    icon: <ShoppingCart className="h-8 w-8" />,
    description:
      "An online store with product management, cart, and checkout.",
  },
  {
    id: "webapp",
    label: PROJECT_TYPE_LABELS.webapp,
    icon: <Monitor className="h-8 w-8" />,
    description:
      "A complex, interactive application with custom features and logic.",
  },
  {
    id: "mobile_app",
    label: PROJECT_TYPE_LABELS.mobile_app,
    icon: <Smartphone className="h-8 w-8" />,
    description:
      "A native or cross-platform application for iOS and Android devices.",
  },
];

export function StepType({
  state,
  currency,
  rates,
  updateState,
  onNext,
}: StepTypeProps) {
  const formatBase = (amountUsd: number) =>
    formatUsdAsCurrency(amountUsd, currency, rates);
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900">
          What kind of project are you building?
        </h2>
        <p className="mt-2 text-zinc-500">
          Select the option that best describes your needs.
        </p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROJECT_TYPES.map((type) => (
          <EstimatorTierCard
            key={type.id}
            isSelected={state.type === type.id}
            onSelect={() => updateState({ type: type.id })}
            icon={type.icon}
            label={type.label}
            description={type.description}
            detail={PROJECT_TYPE_DELIVERABLES[type.id]}
            priceLabel={
              supportsTemplateDesign(type.id) ? (
                <>
                  From {formatBase(getLowestBasePrice(type.id))} template
                  <span className="font-normal text-zinc-500">
                    {" "}
                    · {formatBase(BASE_PRICES[type.id])} custom
                  </span>
                </>
              ) : (
                <>From {formatBase(BASE_PRICES[type.id])}</>
              )
            }
          />
        ))}
      </div>

      <div className="mt-auto flex justify-end">
        <button
          type="button"
          onClick={onNext}
          disabled={!state.type}
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
