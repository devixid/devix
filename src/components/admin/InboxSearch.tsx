"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminDateRangeFilter } from "@/components/admin/AdminDateRangeFilter";

export function InboxSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams?.get("query") || "";
  const currentStatus = searchParams?.get("status") || "all";
  const currentSource = searchParams?.get("source") || "all";
  const currentDateFrom = searchParams?.get("dateFrom") || "";
  const currentDateTo = searchParams?.get("dateTo") || "";

  const [search, setSearch] = useState(currentQuery);

  const updateParams = useCallback(
    (updates: {
      query?: string;
      status?: string;
      source?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      const params = new URLSearchParams(searchParams?.toString());

      const setOrDelete = (key: string, value: string | undefined, skipValue?: string) => {
        if (value && value !== skipValue) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      };

      if (updates.query !== undefined) setOrDelete("query", updates.query);
      if (updates.status !== undefined) setOrDelete("status", updates.status, "all");
      if (updates.source !== undefined) setOrDelete("source", updates.source, "all");
      if (updates.dateFrom !== undefined) setOrDelete("dateFrom", updates.dateFrom);
      if (updates.dateTo !== undefined) setOrDelete("dateTo", updates.dateTo);

      startTransition(() => {
        router.push(`/admin/inbox?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      if (search !== currentQuery) {
        updateParams({ query: search });
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [search, currentQuery, updateParams]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inquiries by sender, email, or message content..."
          className="w-full rounded-none border border-zinc-800 bg-[#0F0F0F] px-5 py-4 text-sm text-white placeholder-zinc-600 transition-colors duration-300 focus:border-[#C8A96E] focus:outline-none"
        />
        {isPending && (
          <div className="absolute top-1/2 right-5 flex -translate-y-1/2 items-center">
            <span className="text-[10px] tracking-wider text-zinc-500 uppercase">
              Searching...
            </span>
          </div>
        )}
      </div>

      <div className="flex overflow-x-auto border-b border-zinc-900">
        {(
          [
            { value: "all", label: "All" },
            { value: "unread", label: "Unread" },
            { value: "read", label: "Read" },
            { value: "NEW", label: "New" },
            { value: "IN_PROGRESS", label: "In Progress" },
            { value: "CLOSED", label: "Closed" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ status: tab.value })}
            className={`border-b-2 px-5 py-4 font-sans text-xs tracking-[0.15em] whitespace-nowrap uppercase transition-all duration-300 ${
              currentStatus === tab.value
                ? "border-[#C8A96E] text-[#C8A96E]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex overflow-x-auto border-b border-zinc-900">
        {(
          [
            { value: "all", label: "All Sources" },
            { value: "contact", label: "Contact" },
            { value: "estimator", label: "Estimator" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ source: tab.value })}
            className={`border-b-2 px-5 py-3 font-sans text-xs tracking-[0.15em] whitespace-nowrap uppercase transition-all duration-300 ${
              currentSource === tab.value
                ? "border-[#C8A96E] text-[#C8A96E]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AdminDateRangeFilter
        dateFrom={currentDateFrom}
        dateTo={currentDateTo}
        onDateFromChange={(value) => updateParams({ dateFrom: value })}
        onDateToChange={(value) => updateParams({ dateTo: value })}
        onClear={() => updateParams({ dateFrom: "", dateTo: "" })}
      />
    </div>
  );
}

export default InboxSearch;
