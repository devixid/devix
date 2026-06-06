"use client";

import { m } from "framer-motion";
import { Check } from "lucide-react";

const easeSmooth = [0.22, 1, 0.36, 1] as const;

interface EstimatorCheckboxProps {
  checked: boolean;
  disabled?: boolean;
  locked?: boolean;
  onChange?: (checked: boolean) => void;
  "aria-label"?: string;
}

export function EstimatorCheckbox({
  checked,
  disabled = false,
  locked = false,
  onChange,
  "aria-label": ariaLabel,
}: EstimatorCheckboxProps) {
  const isInteractive = !disabled && !locked && onChange;

  return (
    <m.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled || locked}
      aria-label={ariaLabel}
      disabled={!isInteractive}
      onClick={(e) => {
        e.stopPropagation();
        if (isInteractive) onChange(!checked);
      }}
      whileTap={isInteractive ? { scale: 0.9 } : undefined}
      className={`mt-0.5 shrink-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 ${
        isInteractive ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <m.span
        className="flex h-5 w-5 items-center justify-center rounded-md border-2"
        initial={false}
        animate={{
          backgroundColor: checked
            ? locked
              ? "#fafafa"
              : "#C8A96E"
            : "#ffffff",
          borderColor: checked
            ? locked
              ? "#e4e4e7"
              : "#C8A96E"
            : "#d4d4d8",
        }}
        transition={{
          backgroundColor: { duration: 0.22, ease: easeSmooth },
          borderColor: { duration: 0.22, ease: easeSmooth },
        }}
      >
        <m.span
          className="flex items-center justify-center"
          initial={false}
          animate={{
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 26,
          }}
        >
          <Check
            className={`h-3 w-3 ${locked ? "text-zinc-400" : "text-white"}`}
            strokeWidth={3}
          />
        </m.span>
      </m.span>
    </m.button>
  );
}
