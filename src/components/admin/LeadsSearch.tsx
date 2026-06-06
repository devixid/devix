"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminDateRangeFilter } from "@/components/admin/AdminDateRangeFilter";

export function LeadsSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams?.get("query") || "";
  const currentStatus = searchParams?.get("status") || "all";
  const currentDateFrom = searchParams?.get("dateFrom") || "";
  const currentDateTo = searchParams?.get("dateTo") || "";

  const [search, setSearch] = useState(currentQuery);

  const updateParams = useCallback(
    (updates: {
      query?: string;
      status?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      const params = new URLSearchParams(searchParams?.toString());

      if (updates.query !== undefined) {
        if (updates.query) params.set("query", updates.query);
        else params.delete("query");
      }
      if (updates.status !== undefined) {
        if (updates.status && updates.status !== "all") params.set("status", updates.status);
        else params.delete("status");
      }
      if (updates.dateFrom !== undefined) {
        if (updates.dateFrom) params.set("dateFrom", updates.dateFrom);
        else params.delete("dateFrom");
      }
      if (updates.dateTo !== undefined) {
        if (updates.dateTo) params.set("dateTo", updates.dateTo);
        else params.delete("dateTo");
      }

      startTransition(() => {
        router.push(`/admin/leads?${params.toString()}`);
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

  const tabs = [
    { value: "all", label: "All" },
    { value: "NEW", label: "New" },
    { value: "CONTACTED", label: "Contacted" },
    { value: "CONVERTED", label: "Converted" },
    { value: "CLOSED", label: "Closed" },
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by project type, scope, or budget..."
          className="w-full rounded-none border border-zinc-800 bg-[#0F0F0F] px-5 py-4 text-sm text-white placeholder-zinc-600 focus:border-[#C8A96E] focus:outline-none"
        />
        {isPending && (
          <div className="absolute top-1/2 right-5 -translate-y-1/2 text-[10px] tracking-wider text-zinc-500 uppercase">
            Searching...
          </div>
        )}
      </div>

      <div className="flex overflow-x-auto border-b border-zinc-900">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => updateParams({ status: tab.value })}
            className={`border-b-2 px-5 py-4 text-xs tracking-[0.15em] whitespace-nowrap uppercase transition-colors ${
              currentStatus === tab.value
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
