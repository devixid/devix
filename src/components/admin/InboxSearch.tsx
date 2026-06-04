"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function InboxSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Initial values from search params
  const currentQuery = searchParams?.get("query") || "";
  const currentStatus = searchParams?.get("status") || "all";

  const [search, setSearch] = useState(currentQuery);

  const updateParams = useCallback((updates: { query?: string; status?: string }) => {
    const params = new URLSearchParams(searchParams?.toString());

    if (updates.query !== undefined) {
      if (updates.query) {
        params.set("query", updates.query);
      } else {
        params.delete("query");
      }
    }

    if (updates.status !== undefined) {
      if (updates.status && updates.status !== "all") {
        params.set("status", updates.status);
      } else {
        params.delete("status");
      }
    }

    startTransition(() => {
      router.push(`/admin/inbox?${params.toString()}`);
    });
  }, [router, searchParams]);

  // Debounced search term effect
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
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search inquiries by sender, email, or message content..."
          className="w-full bg-[#0F0F0F] border border-zinc-800 rounded-none px-5 py-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-[#C8A96E] transition-colors duration-300"
        />
        {isPending && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">Searching...</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-zinc-900 overflow-x-auto">
        {(["all", "unread", "read"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => updateParams({ status: tab })}
            className={`px-6 py-4 text-xs font-sans uppercase tracking-[0.2em] transition-all duration-300 border-b-2 whitespace-nowrap ${
              currentStatus === tab
                ? "border-[#C8A96E] text-[#C8A96E]"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab} submissions
          </button>
        ))}
      </div>
    </div>
  );
}
export default InboxSearch;
