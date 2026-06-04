import Link from "next/link";
import { getInboxSubmissions } from "@/actions/admin";
import InboxSearch from "@/components/admin/InboxSearch";

export const metadata = {
  title: "Inbox Messages — Devix Operations",
};

interface Props {
  searchParams: Promise<{
    query?: string;
    status?: "all" | "unread" | "read";
  }>;
}

export default async function InboxPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.query;
  const status = resolvedSearchParams.status;

  const submissions = await getInboxSubmissions({ query, status });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <span className="text-[11px] font-medium tracking-[0.25em] uppercase text-zinc-500 block mb-3">
          Inbox
        </span>
        <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
          Client Messages
        </h1>
        <p className="font-sans text-sm text-zinc-400 mt-2 max-w-xl">
          Review and reply to incoming service inquiries from global partners.
        </p>
      </div>

      {/* Search and Filters */}
      <InboxSearch />

      {/* Submissions List */}
      <div className="border border-zinc-800 bg-[#0F0F0F] divide-y divide-zinc-900">
        {submissions.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-sans text-sm">
            No inquiries match your query.
          </div>
        ) : (
          submissions.map((sub) => (
            <Link
              key={sub.id}
              href={`/admin/inbox/${sub.id}`}
              className="flex flex-col md:flex-row md:items-center justify-between p-6 gap-4 hover:bg-[#121212] transition-colors duration-300 group"
            >
              <div className="space-y-1.5 max-w-2xl min-w-0">
                <div className="flex items-center gap-3">
                  {/* Unread indicator dot */}
                  {!sub.isRead && (
                    <span className="h-2 w-2 bg-[#C8A96E] shrink-0" title="Unread" />
                  )}
                  <h3 className="font-sans font-medium text-sm text-zinc-200 group-hover:text-[#C8A96E] transition-colors duration-300 truncate">
                    {sub.name}
                  </h3>
                  <span className="text-[10px] text-zinc-600 font-mono truncate hidden sm:inline">
                    {sub.email}
                  </span>
                </div>
                
                {/* Truncated message content */}
                <p className="text-xs text-zinc-400 font-sans line-clamp-2 leading-relaxed">
                  {sub.message}
                </p>
              </div>

              {/* Timestamp */}
              <div className="flex items-center gap-3 text-right shrink-0">
                <span className="text-[11px] font-sans text-zinc-500">
                  {new Date(sub.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-zinc-600 group-hover:translate-x-1 transition-transform duration-300 hidden md:inline">
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
