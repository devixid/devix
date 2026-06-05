import type { EstimatorState, ProjectScope } from "@/types/estimator";
import { FileText, Layers, Library } from "lucide-react";
import type { ReactNode } from "react";

interface StepScopeProps {
  state: EstimatorState;
  updateState: (updates: Partial<EstimatorState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const SCOPE_OPTIONS: { id: ProjectScope; label: string; icon: ReactNode; description: string }[] = [
  {
    id: "small",
    label: "1 - 5 Pages",
    icon: <FileText className="h-8 w-8" />,
    description: "Perfect for startups and small businesses needing an online presence.",
  },
  {
    id: "medium",
    label: "5 - 15 Pages",
    icon: <Layers className="h-8 w-8" />,
    description: "Ideal for growing companies with multiple services or product lines.",
  },
  {
    id: "large",
    label: "15+ Pages",
    icon: <Library className="h-8 w-8" />,
    description: "For large organizations requiring comprehensive content management.",
  },
];

export function StepScope({ state, updateState, onNext, onBack }: StepScopeProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900">How large is your project?</h2>
        <p className="mt-2 text-zinc-500">Estimate the number of unique pages or views required.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 mb-8">
        {SCOPE_OPTIONS.map((option) => {
          const isSelected = state.scope === option.id;
          return (
            <button
              key={option.id}
              onClick={() => updateState({ scope: option.id })}
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
          disabled={!state.scope}
          className="group relative inline-flex items-center gap-x-2 rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:bg-zinc-800"
        >
          <span>Continue</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
}
