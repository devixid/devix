"use client";

import dynamic from "next/dynamic";

function StepSkeleton() {
  return (
    <div
      className="min-h-[280px] animate-pulse rounded-lg bg-zinc-200/60"
      aria-hidden
    />
  );
}

export const StepType = dynamic(
  () =>
    import("@/components/molecules/estimator/StepType").then((m) => ({
      default: m.StepType,
    })),
  { loading: StepSkeleton },
);

export const StepDesign = dynamic(
  () =>
    import("@/components/molecules/estimator/StepDesign").then((m) => ({
      default: m.StepDesign,
    })),
  { loading: StepSkeleton },
);

export const StepPlatform = dynamic(
  () =>
    import("@/components/molecules/estimator/StepPlatform").then((m) => ({
      default: m.StepPlatform,
    })),
  { loading: StepSkeleton },
);

export const StepScope = dynamic(
  () =>
    import("@/components/molecules/estimator/StepScope").then((m) => ({
      default: m.StepScope,
    })),
  { loading: StepSkeleton },
);

export const StepComplexity = dynamic(
  () =>
    import("@/components/molecules/estimator/StepComplexity").then((m) => ({
      default: m.StepComplexity,
    })),
  { loading: StepSkeleton },
);

export const StepTimeline = dynamic(
  () =>
    import("@/components/molecules/estimator/StepTimeline").then((m) => ({
      default: m.StepTimeline,
    })),
  { loading: StepSkeleton },
);

export const StepCustomize = dynamic(
  () =>
    import("@/components/molecules/estimator/StepCustomize").then((m) => ({
      default: m.StepCustomize,
    })),
  { loading: StepSkeleton },
);

export const StepResult = dynamic(
  () =>
    import("@/components/molecules/estimator/StepResult").then((m) => ({
      default: m.StepResult,
    })),
  { loading: StepSkeleton },
);

export const StepContact = dynamic(
  () =>
    import("@/components/molecules/estimator/StepContact").then((m) => ({
      default: m.StepContact,
    })),
  { loading: StepSkeleton },
);
