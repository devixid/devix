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
    <div className="space-y-10 max-w-4xl">
      {/* Back button */}
      <div>
        <Link
          href="/admin/inbox"
          className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Return to Inbox
        </Link>
      </div>

      {/* Message Card */}
      <div className="border border-zinc-800 bg-[#0F0F0F] p-8 md:p-12 space-y-8">
        
        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8 border-b border-zinc-900">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
              Sender Name
            </span>
            <span className="text-sm font-medium text-zinc-200 block">
              {submission.name}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
              Email Address
            </span>
            <span className="text-sm font-mono text-zinc-200 block">
              {submission.email}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
              Date Received
            </span>
            <span className="text-sm text-zinc-300 block">
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
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-1">
              Status
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className={`h-2.5 w-2.5 ${submission.isRead ? "bg-zinc-700" : "bg-[#C8A96E]"}`} />
              <span className="text-xs uppercase tracking-wider font-medium text-zinc-400">
                {submission.isRead ? "Read" : "New Message"}
              </span>
            </div>
          </div>
        </div>

        {/* Message Content */}
        <div className="space-y-3">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 block">
            Message
          </span>
          <p className="font-sans text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
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
