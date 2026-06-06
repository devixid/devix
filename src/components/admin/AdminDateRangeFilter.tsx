"use client";

interface AdminDateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onClear: () => void;
}

export function AdminDateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
}: AdminDateRangeFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <label
          htmlFor="date-from"
          className="mb-1.5 block text-[10px] tracking-[0.15em] text-zinc-500 uppercase"
        >
          From
        </label>
        <input
          id="date-from"
          type="date"
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          className="rounded-none border border-zinc-800 bg-[#0F0F0F] px-3 py-2 text-sm text-white focus:border-[#C8A96E] focus:outline-none"
        />
      </div>
      <div>
        <label
          htmlFor="date-to"
          className="mb-1.5 block text-[10px] tracking-[0.15em] text-zinc-500 uppercase"
        >
          To
        </label>
        <input
          id="date-to"
          type="date"
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          className="rounded-none border border-zinc-800 bg-[#0F0F0F] px-3 py-2 text-sm text-white focus:border-[#C8A96E] focus:outline-none"
        />
      </div>
      {(dateFrom || dateTo) && (
        <button
          type="button"
          onClick={onClear}
          className="px-2 py-2 text-[10px] tracking-wider text-zinc-500 uppercase hover:text-zinc-300"
        >
          Clear dates
        </button>
      )}
    </div>
  );
}
