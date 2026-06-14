"use client";

import { useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AdminDateRangeFilter } from "@/components/admin/AdminDateRangeFilter";

export function PurchasesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentDateFrom = searchParams?.get("dateFrom") || "";
  const currentDateTo = searchParams?.get("dateTo") || "";

  const updateParams = useCallback(
    (updates: { dateFrom?: string; dateTo?: string }) => {
      const params = new URLSearchParams(searchParams?.toString());

      if (updates.dateFrom !== undefined) {
        if (updates.dateFrom) params.set("dateFrom", updates.dateFrom);
        else params.delete("dateFrom");
      }
      if (updates.dateTo !== undefined) {
        if (updates.dateTo) params.set("dateTo", updates.dateTo);
        else params.delete("dateTo");
      }

      startTransition(() => {
        router.push(`/admin/purchases?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border border-zinc-800 bg-[#0F0F0F] p-4">
      <AdminDateRangeFilter
        dateFrom={currentDateFrom}
        dateTo={currentDateTo}
        onDateFromChange={(value) => updateParams({ dateFrom: value })}
        onDateToChange={(value) => updateParams({ dateTo: value })}
        onClear={() => updateParams({ dateFrom: "", dateTo: "" })}
      />

      <a
        href={`/api/admin/purchases/export?${searchParams?.toString() ?? ""}`}
        className={`inline-flex items-center gap-2 border border-zinc-700 px-4 py-2.5 text-xs tracking-[0.15em] text-zinc-300 uppercase transition-colors hover:border-[#C8A96E] hover:text-[#C8A96E] ${
          isPending ? "pointer-events-none opacity-50" : ""
        }`}
        aria-label="Export filtered purchases as CSV"
      >
        Export CSV
      </a>
    </div>
  );
}
