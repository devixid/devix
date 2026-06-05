import { ChevronDown } from "lucide-react";

type SortOption = "newest" | "oldest" | "az" | "za";

interface SortDropdownProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="relative inline-flex items-center">
      <span className="mr-3 text-sm text-zinc-500">Sort by:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as SortOption)}
          className="focus:border-accent focus:ring-accent/10 cursor-pointer appearance-none rounded-lg border border-zinc-200 bg-white py-2 pr-10 pl-4 text-sm font-medium text-black transition-colors outline-none hover:border-zinc-300 focus:ring-2"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A - Z</option>
          <option value="za">Z - A</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500">
          <ChevronDown size={14} />
        </div>
      </div>
    </div>
  );
}
