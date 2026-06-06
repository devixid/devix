import type { EstimatorState, ProjectComplexity } from "@/types/estimator";
import { COMPLEXITY_LABELS } from "@/lib/estimator-labels";
import { COMPLEXITY_DELIVERABLES } from "@/lib/estimator-deliverables";
import { EstimatorTierCard } from "./EstimatorTierCard";
import { LayoutTemplate, Sparkles, Gem } from "lucide-react";
import type { ReactNode } from "react";

interface StepComplexityProps {
  state: EstimatorState;
  updateState: (updates: Partial<EstimatorState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const COMPLEXITY_OPTIONS: {
  id: ProjectComplexity;
  label: string;
  icon: ReactNode;
  description: string;
}[] = [
  {
    id: "basic",
    label: COMPLEXITY_LABELS.basic,
    icon: <LayoutTemplate className="h-8 w-8" />,
    description:
      "Clean, minimal design with standard components and fast loading times.",
  },
  {
    id: "standard",
    label: COMPLEXITY_LABELS.standard,
    icon: <Sparkles className="h-8 w-8" />,
    description:
      "Modern design with smooth transitions and engaging micro-interactions.",
  },
  {
    id: "premium",
    label: COMPLEXITY_LABELS.premium,
    icon: <Gem className="h-8 w-8" />,
    description:
      "Award-winning level design, complex 3D animations, and bespoke UI.",
  },
];

export function StepComplexity({
  state,
  updateState,
  onNext,
  onBack,
}: StepComplexityProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900">
          What level of design & animation?
        </h2>
        <p className="mt-2 text-zinc-500">
          Choose the complexity of the user interface and animations.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {COMPLEXITY_OPTIONS.map((option) => (
          <EstimatorTierCard
            key={option.id}
            isSelected={state.complexity === option.id}
            onSelect={() => updateState({ complexity: option.id })}
            icon={option.icon}
            label={option.label}
            description={option.description}
            detail={COMPLEXITY_DELIVERABLES[option.id]}
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
          disabled={!state.complexity}
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
