import type { EstimatorState, PlatformType } from "@/types/estimator";
import { PLATFORM_LABELS } from "@/lib/estimator-labels";
import { PLATFORM_DELIVERABLES } from "@/lib/estimator-deliverables";
import { EstimatorTierCard } from "./EstimatorTierCard";
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
    label: PLATFORM_LABELS.android,
    icon: <Smartphone className="h-8 w-8 text-green-600" />,
    description:
      "Build a native app optimized specifically for the Android ecosystem.",
  },
  {
    id: "ios",
    label: PLATFORM_LABELS.ios,
    icon: <Smartphone className="h-8 w-8 text-blue-600" />,
    description:
      "Build a native app optimized specifically for Apple's iOS ecosystem.",
  },
  {
    id: "both",
    label: PLATFORM_LABELS.both,
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
        {PLATFORM_OPTIONS.map((option) => (
          <EstimatorTierCard
            key={option.id}
            isSelected={state.platform === option.id}
            onSelect={() => updateState({ platform: option.id })}
            icon={option.icon}
            label={option.label}
            description={option.description}
            detail={PLATFORM_DELIVERABLES[option.id]}
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
