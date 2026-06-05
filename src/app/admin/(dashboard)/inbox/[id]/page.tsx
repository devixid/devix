import { notFound } from "next/navigation";
import Link from "next/link";
import { getSubmissionById, markSubmissionAsRead } from "@/actions/admin";
import InboxActionButtons from "@/components/admin/InboxActionButtons";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function InboxDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const submission = await getSubmissionById(id);
  if (!submission) {
    notFound();
  }

  // Auto-mark as read if not already read
  if (!submission.isRead) {
    await markSubmissionAsRead(id, true);
  }

  return (
    <div className="max-w-4xl space-y-10">
      {/* Back button */}
      <div>
        <Link
          href="/admin/inbox"
          className="inline-flex items-center gap-2 font-sans text-xs tracking-[0.2em] text-zinc-500 uppercase transition-colors hover:text-zinc-300"
        >
          ← Return to Inbox
        </Link>
      </div>

      {/* Message Card */}
      <div className="space-y-8 border border-zinc-800 bg-[#0F0F0F] p-8 md:p-12">
        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-6 border-b border-zinc-900 pb-8 md:grid-cols-2">
          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-500 uppercase">
              Sender Name
            </span>
            <span className="block text-sm font-medium text-zinc-200">
              {submission.name}
            </span>
          </div>

          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-500 uppercase">
              Email Address
            </span>
            <span className="block font-mono text-sm text-zinc-200">
              {submission.email}
            </span>
          </div>

          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-500 uppercase">
              Date Received
            </span>
            <span className="block text-sm text-zinc-300">
              {new Date(submission.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div>
            <span className="mb-1 block text-[10px] tracking-wider text-zinc-500 uppercase">
              Status
            </span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 ${submission.isRead ? "bg-zinc-700" : "bg-[#C8A96E]"}`}
              />
              <span className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
                {submission.isRead ? "Read" : "New Message"}
              </span>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-3">
          <span className="block text-[10px] tracking-wider text-zinc-500 uppercase">
            Message
          </span>
          <p className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
            {submission.message}
          </p>
        </div>

        {/* Actions Controls */}
        <InboxActionButtons
          id={submission.id}
          isRead={submission.isRead}
          email={submission.email}
          name={submission.name}
        />
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
export const revalidate = 0;
