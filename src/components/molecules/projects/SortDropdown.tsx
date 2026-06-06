"use client";

import { DropdownSelect } from "@/components/molecules/DropdownSelect";

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
  return (
    <div className="relative inline-flex items-center">
      <span className="mr-3 hidden text-sm font-medium tracking-wider text-zinc-400 uppercase sm:inline-block">
        Sort
      </span>
      <DropdownSelect
        value={value}
        onChange={onChange}
        variant="pill"
        menuAlign="right"
        options={sortOptions}
      />
    </div>
  );
}
