import Link from "next/link";
import {
  getInboxSubmissions,
  type InboxFilterStatus,
  type InboxSourceFilter,
} from "@/actions/admin";
import InboxSearch from "@/components/admin/InboxSearch";

export const metadata = {
  title: "Inbox Messages — Devix Operations",
};

interface Props {
  searchParams: Promise<{
    query?: string;
    status?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function InboxPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const { query, status, source, dateFrom, dateTo } = resolvedSearchParams;

  const submissions = await getInboxSubmissions({
    query,
    status: status as InboxFilterStatus | undefined,
    source: source as InboxSourceFilter | undefined,
    dateFrom,
    dateTo,
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
          Inbox
        </span>
        <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
          Client Messages
        </h1>
        <p className="mt-2 max-w-xl font-sans text-sm text-zinc-400">
          Review and reply to incoming service inquiries from global partners.
        </p>
      </div>

      {/* Search and Filters */}
      <InboxSearch />

      {/* Submissions List */}
      <div className="divide-y divide-zinc-900 border border-zinc-800 bg-[#0F0F0F]">
        {submissions.length === 0 ? (
          <div className="p-12 text-center font-sans text-sm text-zinc-500">
            No inquiries match your query.
          </div>
        ) : (
          submissions.map((sub) => (
            <Link
              key={sub.id}
              href={`/admin/inbox/${sub.id}`}
              className="group flex flex-col justify-between gap-4 p-6 transition-colors duration-300 hover:bg-[#121212] md:flex-row md:items-center"
            >
              <div className="max-w-2xl min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  {!sub.isRead && (
                    <span
                      className="h-2 w-2 shrink-0 bg-[#C8A96E]"
                      title="Unread"
                    />
                  )}
                  <span className="bg-zinc-800 px-2 py-0.5 text-[9px] font-medium tracking-wider text-zinc-400 uppercase">
                    {sub.status.replace("_", " ")}
                  </span>
                  {sub.source === "estimator" && (
                    <span className="bg-[#C8A96E]/10 px-2 py-0.5 text-[9px] font-medium tracking-wider text-[#C8A96E] uppercase">
                      Estimator
                    </span>
                  )}
                  <h3 className="truncate font-sans text-sm font-medium text-zinc-200 transition-colors duration-300 group-hover:text-[#C8A96E]">
                    {sub.name}
                  </h3>
                  <span className="hidden truncate font-mono text-[10px] text-zinc-600 sm:inline">
                    {sub.email}
                  </span>
                </div>

                {/* Truncated message content */}
                <p className="line-clamp-2 font-sans text-xs leading-relaxed text-zinc-400">
                  {sub.message}
                </p>
              </div>

              {/* Timestamp */}
              <div className="flex shrink-0 items-center gap-3 text-right">
                <span className="font-sans text-[11px] text-zinc-500">
                  {new Date(sub.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="hidden text-zinc-600 transition-transform duration-300 group-hover:translate-x-1 md:inline">
                  →
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
