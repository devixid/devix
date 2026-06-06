"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Check, X } from "lucide-react";
import type { EstimatorDetailContent } from "@/lib/estimator-deliverables";
import { formatUsdBasePrice } from "@/types/estimator";

interface EstimatorDetailModalProps {
  open: boolean;
  onClose: () => void;
  content: EstimatorDetailContent;
}

export function EstimatorDetailModal({
  open,
  onClose,
  content,
}: EstimatorDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex max-h-[min(85vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-zinc-100 px-6 py-5">
          <div className="min-w-0 pr-2">
            <h3
              id={titleId}
              className="text-lg font-medium text-zinc-900"
            >
              {content.title}
            </h3>
            {content.subtitle && (
              <p className="mt-1 text-sm text-zinc-500">{content.subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-full p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-3 text-[11px] font-medium tracking-[0.15em] text-zinc-400 uppercase">
            What&apos;s included
          </p>
          <ul className="space-y-2.5">
            {content.includes.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 text-sm text-zinc-700"
              >
                <div className="flex gap-2.5">
                  <Check className="text-accent mt-0.5 h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {!item.required && item.deductionUsd > 0 && (
                  <span className="shrink-0 text-xs text-zinc-400">
                    −{formatUsdBasePrice(item.deductionUsd)}
                  </span>
                )}
              </li>
            ))}
          </ul>

          {content.notIncluded && content.notIncluded.length > 0 && (
            <>
              <p className="mt-6 mb-3 text-[11px] font-medium tracking-[0.15em] text-zinc-400 uppercase">
                Not included
              </p>
              <ul className="space-y-2">
                {content.notIncluded.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm text-zinc-400"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="mt-6 text-xs text-zinc-400">
            Final scope is confirmed during consultation. Add-ons available on
            request.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
