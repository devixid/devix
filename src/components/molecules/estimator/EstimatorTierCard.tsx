"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import type { EstimatorDetailContent } from "@/lib/estimator-deliverables";

const EstimatorDetailModal = dynamic(
  () =>
    import("./EstimatorDetailModal").then((m) => ({
      default: m.EstimatorDetailModal,
    })),
  { ssr: false },
);

interface EstimatorTierCardProps {
  isSelected: boolean;
  onSelect: () => void;
  icon: ReactNode;
  label: string;
  description: string;
  priceLabel?: ReactNode;
  badge?: string;
  detail: EstimatorDetailContent;
}

export function EstimatorTierCard({
  isSelected,
  onSelect,
  icon,
  label,
  description,
  priceLabel,
  badge,
  detail,
}: EstimatorTierCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);

  return (
    <>
      <div
        className={`group relative flex flex-col rounded-xl border transition-all duration-300 ${
          isSelected
            ? "border-accent bg-accent/10 shadow-[0_0_20px_rgba(var(--color-accent),0.05)]"
            : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50"
        }`}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex w-full flex-col items-start p-6 pb-3 text-left"
        >
          {badge && (
            <span className="bg-accent/15 text-accent mb-3 rounded-full px-2.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
              {badge}
            </span>
          )}
          <div
            className={`mb-4 rounded-lg p-3 transition-colors ${
              isSelected
                ? "bg-accent text-white"
                : "bg-zinc-100 text-zinc-500 group-hover:text-zinc-700"
            }`}
          >
            {icon}
          </div>
          <h3
            className={`text-lg font-medium ${
              isSelected ? "text-accent" : "text-zinc-900"
            }`}
          >
            {label}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            {description}
          </p>
          {priceLabel && (
            <p
              className={`mt-3 text-sm font-medium ${
                isSelected ? "text-accent" : "text-zinc-700"
              }`}
            >
              {priceLabel}
            </p>
          )}
        </button>

        <div className="px-6 pb-4">
          <button
            type="button"
            onClick={() => setDetailOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-accent"
          >
            <Info className="h-3.5 w-3.5" />
            View deliverables
          </button>
        </div>

        {isSelected && (
          <div className="bg-accent absolute top-4 right-4 h-3 w-3 animate-pulse rounded-full" />
        )}
      </div>

      {detailOpen && (
        <EstimatorDetailModal
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          content={detail}
        />
      )}
    </>
  );
}
