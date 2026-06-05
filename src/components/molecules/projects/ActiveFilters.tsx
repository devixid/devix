import { X } from "lucide-react";

interface ActiveFiltersProps {
  searchQuery: string;
  category: string;
  techStacks: string[];
  developers: string[];
  onRemoveSearch: () => void;
  onRemoveCategory: () => void;
  onRemoveTech: (tech: string) => void;
  onRemoveDev: (dev: string) => void;
  onClearAll: () => void;
  resultsCount: number;
}

export default function ActiveFilters({
  searchQuery,
  category,
  techStacks,
  developers,
  onRemoveSearch,
  onRemoveCategory,
  onRemoveTech,
  onRemoveDev,
  onClearAll,
  resultsCount,
}: ActiveFiltersProps) {
  return (
    <div className="mb-8 flex flex-col items-start gap-4 border-b border-zinc-100 pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm text-zinc-500">Active filters:</span>

        {searchQuery && (
          <Badge
            label={`Search: "${searchQuery}"`}
            onRemove={onRemoveSearch}
          />
        )}
        {category !== "All" && (
          <Badge
            label={`Category: ${category}`}
            onRemove={onRemoveCategory}
          />
        )}
        {techStacks.map((t) => (
          <Badge
            key={t}
            label={`Tech: ${t}`}
            onRemove={() => onRemoveTech(t)}
          />
        ))}
        {developers.map((d) => (
          <Badge
            key={d}
            label={`Dev: ${d}`}
            onRemove={() => onRemoveDev(d)}
          />
        ))}

        <button
          onClick={onClearAll}
          className="text-accent hover:text-accent-light ml-2 text-xs font-medium hover:underline"
        >
          Clear all
        </button>
      </div>

      <div className="text-sm text-zinc-500">
        Showing{" "}
        <strong className="font-medium text-black">{resultsCount}</strong>{" "}
        projects
      </div>
    </div>
  );
}

function Badge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-x-1.5 rounded-md bg-zinc-100 py-1 pr-1.5 pl-2.5 text-xs font-medium text-zinc-700">
      {label}
      <button
        onClick={onRemove}
        className="rounded-full p-0.5 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600"
      >
        <X size={12} />
      </button>
    </span>
  );
}
