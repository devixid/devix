"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { m, AnimatePresence } from "framer-motion";

type SortOption = "newest" | "oldest" | "az" | "za";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "az", label: "A - Z" },
  { value: "za", label: "Z - A" },
];

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    sortOptions.find((opt) => opt.value === value)?.label || "Sort by";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <span className="mr-3 text-sm font-medium text-zinc-400 uppercase tracking-wider hidden sm:inline-block">
        Sort
      </span>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex w-44 items-center justify-between rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 outline-none ${
            isOpen
              ? "bg-black text-white"
              : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-black"
          }`}
        >
          <span>{selectedLabel}</span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <m.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-52 origin-top-right overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl z-50"
            >
              <div className="flex flex-col gap-1">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                      value === option.value
                        ? "bg-black text-white shadow-md"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-black"
                    }`}
                  >
                    <span>{option.label}</span>
                    {value === option.value && <Check size={16} />}
                  </button>
                ))}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
