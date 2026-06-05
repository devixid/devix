import type { EstimatorState, ProjectType } from "@/types/estimator";
import { Monitor, ShoppingCart, Briefcase, Smartphone } from "lucide-react";
import type { ReactNode } from "react";

interface StepTypeProps {
  state: EstimatorState;
  updateState: (updates: Partial<EstimatorState>) => void;
  onNext: () => void;
}

const PROJECT_TYPES: { id: ProjectType; label: string; icon: ReactNode; description: string }[] = [
  {
    id: "company_profile",
    label: "Company Profile",
    icon: <Briefcase className="h-8 w-8" />,
    description: "A professional site to showcase your brand, services, and team.",
  },
  {
    id: "ecommerce",
    label: "E-Commerce",
    icon: <ShoppingCart className="h-8 w-8" />,
    description: "An online store with product management, cart, and checkout.",
  },
  {
    id: "webapp",
    label: "Custom Web App",
    icon: <Monitor className="h-8 w-8" />,
    description: "A complex, interactive application with custom features and logic.",
  },
  {
    id: "mobile_app",
    label: "Mobile App",
    icon: <Smartphone className="h-8 w-8" />,
    description: "A native or cross-platform application for iOS and Android devices.",
  },
];

export function StepType({ state, updateState, onNext }: StepTypeProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900">What kind of project are you building?</h2>
        <p className="mt-2 text-zinc-500">Select the option that best describes your needs.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {PROJECT_TYPES.map((type) => {
          const isSelected = state.type === type.id;
          return (
            <button
              key={type.id}
              onClick={() => updateState({ type: type.id })}
              className={`group relative flex flex-col items-start rounded-xl border p-6 text-left transition-all duration-300 ${
                isSelected
                  ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--color-accent),0.05)]"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <div className={`mb-4 rounded-lg p-3 transition-colors ${isSelected ? "bg-accent text-white" : "bg-zinc-100 text-zinc-500 group-hover:text-zinc-700"}`}>
                {type.icon}
              </div>
              <h3 className={`text-lg font-medium ${isSelected ? "text-accent" : "text-zinc-900"}`}>
                {type.label}
              </h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                {type.description}
              </p>
              
              {isSelected && (
                <div className="absolute top-4 right-4 h-3 w-3 rounded-full bg-accent animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-auto flex justify-end">
        <button
          onClick={onNext}
          disabled={!state.type}
          className="group relative inline-flex items-center gap-x-2 rounded-full bg-black px-8 py-3 text-sm font-medium text-white transition-transform disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 hover:bg-zinc-800"
        >
          <span>Continue</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
}
