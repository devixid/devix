import type { EstimatorState, PlatformType } from "@/types/estimator";
import { Smartphone, Layers } from "lucide-react";
import type { ReactNode } from "react";

interface StepPlatformProps {
  state: EstimatorState;
  updateState: (updates: Partial<EstimatorState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PLATFORM_OPTIONS: {
  id: PlatformType;
  label: string;
  icon: ReactNode;
  description: string;
}[] = [
  {
    id: "android",
    label: "Android Only",
    icon: <Smartphone className="h-8 w-8 text-green-600" />,
    description:
      "Build a native app optimized specifically for the Android ecosystem.",
  },
  {
    id: "ios",
    label: "iOS Only",
    icon: <Smartphone className="h-8 w-8 text-blue-600" />,
    description:
      "Build a native app optimized specifically for Apple's iOS ecosystem.",
  },
  {
    id: "both",
    label: "Both Platforms",
    icon: <Layers className="h-8 w-8 text-indigo-600" />,
    description:
      "A cross-platform solution (React Native/Flutter) targeting iOS and Android.",
  },
];

export function StepPlatform({
  state,
  updateState,
  onNext,
  onBack,
}: StepPlatformProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h2 className="text-2xl font-light text-zinc-900">
          Which platforms do you support?
        </h2>
        <p className="mt-2 text-zinc-500">
          Choose the platforms you want to build and deploy your app for.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-1 md:grid-cols-3">
        {PLATFORM_OPTIONS.map((option) => {
          const isSelected = state.platform === option.id;
          return (
            <button
              key={option.id}
              onClick={() => updateState({ platform: option.id })}
              className={`group relative flex flex-col items-start rounded-xl border p-6 text-left transition-all duration-300 ${
                isSelected
                  ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--color-accent),0.05)]"
                  : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
              }`}
            >
              <div
                className={`mb-4 rounded-lg p-3 transition-colors ${isSelected ? "bg-accent text-white" : "bg-zinc-100 text-zinc-500 group-hover:text-zinc-700"}`}
              >
                {option.icon}
              </div>
              <h3
                className={`text-lg font-medium ${isSelected ? "text-accent" : "text-zinc-900"}`}
              >
                {option.label}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                {option.description}
              </p>

              {isSelected && (
                <div className="bg-accent absolute top-4 right-4 h-3 w-3 animate-pulse rounded-full" />
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
          <span className="transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>
          <span>Back</span>
        </button>
        <button
          onClick={onNext}
          disabled={!state.platform}
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
