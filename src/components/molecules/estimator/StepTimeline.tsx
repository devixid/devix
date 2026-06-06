import type { EstimatorState, ProjectTimeline } from "@/types/estimator";
import { TIMELINE_LABELS } from "@/lib/estimator-labels";
import { TIMELINE_DELIVERABLES } from "@/lib/estimator-deliverables";
import { EstimatorTierCard } from "./EstimatorTierCard";
import { Coffee, Calendar, Zap } from "lucide-react";
import type { ReactNode } from "react";

interface StepTimelineProps {
  state: EstimatorState;
  updateState: (updates: Partial<EstimatorState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIMELINE_OPTIONS: {
  id: ProjectTimeline;
  label: string;
  icon: ReactNode;
  description: string;
}[] = [
  {
    id: "relaxed",
    label: TIMELINE_LABELS.relaxed,
    icon: <Coffee className="h-8 w-8" />,
    description:
      "Flexible deadline. Great for cost-saving if you are not in a hurry.",
  },
  {
    id: "standard",
    label: TIMELINE_LABELS.standard,
    icon: <Calendar className="h-8 w-8" />,
    description: "Normal pace. The ideal balance between speed and perfection.",
  },
  {
    id: "rush",
    label: TIMELINE_LABELS.rush,
    icon: <Zap className="h-8 w-8" />,
    description:
      "High priority development. Requires dedicated overtime to meet the deadline.",
  },
];

export function StepTimeline({
  state,
  updateState,
  onNext,
  onBack,
}: StepTimelineProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900">
          When do you need it live?
        </h2>
        <p className="mt-2 text-zinc-500">
          Select your preferred project completion timeline.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {TIMELINE_OPTIONS.map((option) => (
          <EstimatorTierCard
            key={option.id}
            isSelected={state.timeline === option.id}
            onSelect={() => updateState({ timeline: option.id })}
            icon={option.icon}
            label={option.label}
            description={option.description}
            detail={TIMELINE_DELIVERABLES[option.id]}
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
          disabled={!state.timeline}
          className="group relative inline-flex items-center gap-x-2 rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-transform hover:scale-105 hover:bg-zinc-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span>Calculate Price</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
}
