"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

export type DropdownSelectVariant = "light" | "dark" | "pill";

export interface DropdownSelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

interface DropdownSelectProps<T extends string> {
  id?: string;
  value: T;
  options: DropdownSelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  variant?: DropdownSelectVariant;
  compact?: boolean;
  className?: string;
  menuAlign?: "left" | "right";
  placeholder?: string;
}

const easeSmooth = [0.22, 1, 0.36, 1] as const;

function getTriggerClass(
  variant: DropdownSelectVariant,
  isOpen: boolean,
  compact: boolean,
  _disabled: boolean,
): string {
  const base =
    "inline-flex items-center justify-between gap-x-2 font-medium transition-all outline-none disabled:cursor-not-allowed disabled:opacity-50";

  if (variant === "pill") {
    return `${base} w-44 rounded-full px-5 py-2.5 text-sm ${
      isOpen
        ? "bg-black text-white"
        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-black"
    }`;
  }

  if (variant === "dark") {
    return `${base} min-w-[9rem] rounded-none border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-200 focus:border-accent`;
  }

  return `${base} rounded-lg border border-zinc-200 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50 focus:ring-1 focus:ring-accent ${
    compact ? "px-2.5 py-1.5 text-xs" : "w-32 px-4 py-2 text-sm"
  }`;
}

function getMenuClass(
  variant: DropdownSelectVariant,
  compact: boolean,
  align: "left" | "right",
): string {
  const position =
    align === "right"
      ? "absolute right-0 top-full z-50 mt-2 origin-top-right"
      : "absolute left-0 top-full z-50 mt-1.5 origin-top-left";

  if (variant === "pill") {
    return `${position} w-52 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl focus:outline-none`;
  }

  if (variant === "dark") {
    return `${position} w-52 rounded-none border border-zinc-800 bg-[#0F0F0F] shadow-lg focus:outline-none`;
  }

  return `${position} ${compact ? "w-52" : "w-60"} rounded-lg border border-zinc-200 bg-white shadow-lg focus:outline-none`;
}

function getOptionClass(
  variant: DropdownSelectVariant,
  selected: boolean,
): string {
  const base =
    "flex w-full items-center justify-between text-left transition-colors";

  if (variant === "pill") {
    return `${base} rounded-xl px-4 py-2.5 text-sm font-medium ${
      selected
        ? "bg-black text-white shadow-md"
        : "text-zinc-500 hover:bg-zinc-100 hover:text-black"
    }`;
  }

  if (variant === "dark") {
    return `${base} px-4 py-2 text-xs ${
      selected
        ? "bg-zinc-900 font-medium text-accent"
        : "text-zinc-300 hover:bg-zinc-900"
    }`;
  }

  return `${base} px-4 py-2 text-sm ${
    selected
      ? "bg-zinc-50 font-medium text-accent"
      : "text-zinc-700 hover:bg-zinc-50"
  }`;
}

export function DropdownSelect<T extends string>({
  id,
  value,
  options,
  onChange,
  disabled = false,
  variant = "light",
  compact = false,
  className = "",
  menuAlign,
  placeholder = "Select…",
}: DropdownSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const selectedLabel = selectedOption?.label ?? placeholder;
  const align = menuAlign ?? (variant === "pill" ? "right" : "left");

  useEffect(() => {
    if (!isOpen) return;

    const handleClose = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClose);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const menuContent = (
    <div
      className={
        variant === "pill"
          ? "flex flex-col gap-1"
          : "max-h-60 overflow-y-auto py-1"
      }
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="option"
            aria-selected={selected}
            onClick={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
            className={getOptionClass(variant, selected)}
          >
            <span>{option.label}</span>
            {variant === "pill" && selected ? (
              <Check size={16} />
            ) : option.description ? (
              <span className="text-xs font-light text-zinc-400">
                {option.description}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );

  const menuClassName = getMenuClass(variant, compact, align);

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block text-left ${className}`}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((open) => !open)}
        className={getTriggerClass(variant, isOpen, compact, disabled)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={id ? `${id}-listbox` : undefined}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={variant === "pill" ? 16 : 14}
          className={`shrink-0 text-zinc-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {variant === "pill" ? (
        <AnimatePresence>
          {isOpen && (
            <m.div
              role="listbox"
              id={id ? `${id}-listbox` : undefined}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2, ease: easeSmooth }}
              className={menuClassName}
            >
              {menuContent}
            </m.div>
          )}
        </AnimatePresence>
      ) : (
        isOpen && (
          <div
            role="listbox"
            id={id ? `${id}-listbox` : undefined}
            className={menuClassName}
          >
            {menuContent}
          </div>
        )
      )}
    </div>
  );
}
