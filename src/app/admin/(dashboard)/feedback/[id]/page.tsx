import Link from "next/link";
import { notFound } from "next/navigation";
import { getFeedbackById } from "@/actions/admin/feedback";
import { FeedbackDetailPanel } from "@/components/admin/FeedbackDetailPanel";
import { StarRating } from "@/components/admin/StarRating";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FeedbackDetailPage({ params }: Props) {
  const { id } = await params;
  const feedback = await getFeedbackById(id);

  if (!feedback) {
    notFound();
  }

  const submission = feedback.contactSubmission;

  return (
    <div className="max-w-4xl space-y-10">
      <div>
        <Link
          href="/admin/feedback"
          className="inline-flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-zinc-500 uppercase transition-colors hover:text-zinc-300"
        >
          ← Return to Feedback
        </Link>
      </div>

      <div className="space-y-8 border border-zinc-800 bg-[#0F0F0F] p-8 md:p-12">
        <div className="grid grid-cols-1 gap-6 border-b border-zinc-900 pb-8 md:grid-cols-2">
          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-500 uppercase">
              Client
            </span>
            <span className="block text-sm font-medium text-zinc-200">
              {submission.name}
            </span>
            <span className="mt-1 block font-mono text-sm text-zinc-400">
              {submission.email}
            </span>
          </div>

          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-500 uppercase">
              Submitted
            </span>
            <span className="block text-sm text-zinc-300">
              {new Date(feedback.createdAt).toLocaleString()}
            </span>
          </div>

          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-500 uppercase">
              Rating
            </span>
            <StarRating
              rating={feedback.rating}
              size="md"
            />
          </div>

          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-500 uppercase">
              Linked inquiry
            </span>
            <Link
              href={`/admin/inbox/${submission.id}`}
              className="text-sm text-[#C8A96E] hover:underline"
            >
              View inbox message →
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <span className="block text-[10px] tracking-wider text-zinc-500 uppercase">
            Comment
          </span>
          <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
            {feedback.comment?.trim() || "—"}
          </p>
        </div>

        <FeedbackDetailPanel
          id={feedback.id}
          isRead={feedback.isRead}
        />
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
