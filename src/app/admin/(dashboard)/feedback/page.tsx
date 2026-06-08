import Link from "next/link";
import { getFeedbackList, type FeedbackReadFilter } from "@/actions/admin/feedback";
import { StarRating } from "@/components/admin/StarRating";

export const metadata = {
  title: "Consultation Feedback — Devix Operations",
};

interface Props {
  searchParams: Promise<{
    query?: string;
    isRead?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function FeedbackPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const isRead = (resolved.isRead as FeedbackReadFilter | undefined) ?? "all";

  const feedbackItems = await getFeedbackList({
    query: resolved.query,
    isRead,
    dateFrom: resolved.dateFrom,
    dateTo: resolved.dateTo,
  });

  return (
    <div className="space-y-10">
      <div>
        <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
          Feedback
        </span>
        <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
          Consultation Feedback
        </h1>
        <p className="mt-2 max-w-xl font-sans text-sm text-zinc-400">
          Ratings and comments collected after estimator consultation requests.
        </p>
      </div>

      <form className="flex flex-wrap gap-3">
        <input
          type="search"
          name="query"
          defaultValue={resolved.query ?? ""}
          placeholder="Search name, email, or comment…"
          className="min-w-[200px] flex-1 border border-zinc-800 bg-[#0F0F0F] px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-zinc-600"
        />
        <select
          name="isRead"
          defaultValue={isRead}
          className="border border-zinc-800 bg-[#0F0F0F] px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-zinc-600"
        >
          <option value="all">All</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
        <button
          type="submit"
          className="border border-zinc-700 px-5 py-2.5 text-xs tracking-[0.15em] text-zinc-300 uppercase transition-colors hover:border-zinc-500"
        >
          Filter
        </button>
      </form>

      <div className="divide-y divide-zinc-900 border border-zinc-800 bg-[#0F0F0F]">
        {feedbackItems.length === 0 ? (
          <div className="p-12 text-center font-sans text-sm text-zinc-500">
            No feedback yet.
          </div>
        ) : (
          feedbackItems.map((item) => (
            <Link
              key={item.id}
              href={`/admin/feedback/${item.id}`}
              className="group flex flex-col justify-between gap-4 p-6 transition-colors duration-300 hover:bg-[#121212] md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {!item.isRead && (
                    <span
                      className="h-2 w-2 shrink-0 bg-[#C8A96E]"
                      title="Unread"
                    />
                  )}
                  <StarRating rating={item.rating} />
                  <span className="text-xs text-zinc-500">
                    {item.contactSubmission.name}
                  </span>
                  <span className="font-mono text-xs text-zinc-600">
                    {item.contactSubmission.email}
                  </span>
                </div>
                {item.comment ? (
                  <p className="line-clamp-2 text-sm text-zinc-400">
                    {item.comment}
                  </p>
                ) : (
                  <p className="text-sm text-zinc-600 italic">No comment</p>
                )}
              </div>
              <time className="shrink-0 text-xs text-zinc-500">
                {new Date(item.createdAt).toLocaleString()}
              </time>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
