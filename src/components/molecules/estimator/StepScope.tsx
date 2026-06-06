import type { EstimatorState } from "@/types/estimator";
import {
  getScopeHeading,
  getScopeOptions,
  getScopeSubheading,
} from "@/lib/estimator-labels";
import { getScopeDeliverables } from "@/lib/estimator-deliverables";
import { EstimatorTierCard } from "./EstimatorTierCard";
import { FileText, Layers, Library } from "lucide-react";
import type { ReactNode } from "react";
import type { ProjectScope } from "@/types/estimator";

interface StepScopeProps {
  state: EstimatorState;
  updateState: (updates: Partial<EstimatorState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SCOPE_ICONS: Record<ProjectScope, ReactNode> = {
  small: <FileText className="h-8 w-8" />,
  medium: <Layers className="h-8 w-8" />,
  large: <Library className="h-8 w-8" />,
};

export function StepScope({
  state,
  updateState,
  onNext,
  onBack,
}: StepScopeProps) {
  const projectType = state.type;
  const scopeOptions = getScopeOptions(projectType);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900">
          {getScopeHeading(projectType)}
        </h2>
        <p className="mt-2 text-zinc-500">{getScopeSubheading(projectType)}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {scopeOptions.map((option) => (
          <EstimatorTierCard
            key={option.id}
            isSelected={state.scope === option.id}
            onSelect={() => updateState({ scope: option.id })}
            icon={SCOPE_ICONS[option.id]}
            label={option.label}
            description={option.description}
            detail={getScopeDeliverables(projectType, option.id)}
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
          disabled={!state.scope}
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
