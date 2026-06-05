import type { EstimatorState, ProjectTimeline } from "@/types/estimator";
import { Coffee, Calendar, Zap } from "lucide-react";
import type { ReactNode } from "react";

interface StepTimelineProps {
  state: EstimatorState;
  updateState: (updates: Partial<EstimatorState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIMELINE_OPTIONS: { id: ProjectTimeline; label: string; icon: ReactNode; description: string }[] = [
  {
    id: "relaxed",
    label: "Relaxed (8+ weeks)",
    icon: <Coffee className="h-8 w-8" />,
    description: "Flexible deadline. Great for cost-saving if you are not in a hurry.",
  },
  {
    id: "standard",
    label: "Standard (4-8 weeks)",
    icon: <Calendar className="h-8 w-8" />,
    description: "Normal pace. The ideal balance between speed and perfection.",
  },
  {
    id: "rush",
    label: "Rush (<4 weeks)",
    icon: <Zap className="h-8 w-8" />,
    description: "High priority development. Requires dedicated overtime to meet the deadline.",
  },
];

export function StepTimeline({ state, updateState, onNext, onBack }: StepTimelineProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900">When do you need it live?</h2>
        <p className="mt-2 text-zinc-500">Select your preferred project completion timeline.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 mb-8">
        {TIMELINE_OPTIONS.map((option) => {
          const isSelected = state.timeline === option.id;
          return (
            <button
              key={option.id}
              onClick={() => updateState({ timeline: option.id })}
              className={`group relative flex flex-col items-start rounded-xl border p-6 text-left transition-all duration-300 ${
                isSelected
                  ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--color-accent),0.05)]"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <div className={`mb-4 rounded-lg p-3 transition-colors ${isSelected ? "bg-accent text-white" : "bg-zinc-100 text-zinc-500 group-hover:text-zinc-700"}`}>
                {option.icon}
              </div>
              <h3 className={`text-lg font-medium ${isSelected ? "text-accent" : "text-zinc-900"}`}>
                {option.label}
              </h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                {option.description}
              </p>
              
              {isSelected && (
                <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex justify-between">
        <button
          onClick={onBack}
          className="group relative inline-flex items-center gap-x-2 rounded-full border border-zinc-200 bg-transparent px-8 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-black"
        >
          <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          disabled={!state.timeline}
          className="group relative inline-flex items-center gap-x-2 rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:bg-zinc-800"
        >
          <span>Calculate Price</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
}
