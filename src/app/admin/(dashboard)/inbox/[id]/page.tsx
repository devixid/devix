import { notFound } from "next/navigation";
import Link from "next/link";
import { getSubmissionById } from "@/actions/admin";
import InboxDetailPanel from "@/components/admin/InboxDetailPanel";
import { StarRating } from "@/components/admin/StarRating";
import { getExcludedLabelsForProjectType } from "@/lib/estimator-deliverables";
import { formatUsdDecimal } from "@/lib/money";
import type { ProjectType } from "@/types/estimator";

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
              Workflow Status
            </span>
            <span className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
              {submission.status.replace("_", " ")}
            </span>
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

        {submission.estimatorLead &&
          (() => {
            const lead = submission.estimatorLead;
            const excludedIds = Array.isArray(lead.excludedDeliverables)
              ? (lead.excludedDeliverables as string[])
              : [];
            const excludedLabels = getExcludedLabelsForProjectType(
              lead.projectType as ProjectType,
              excludedIds,
            );

            return (
              <div className="rounded border border-zinc-800 bg-zinc-900/30 p-4 text-sm text-zinc-400">
                <p className="mb-2 text-[10px] tracking-wider text-zinc-500 uppercase">
                  Linked Estimator Data
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <span>Type: {lead.projectType}</span>
                  {lead.designApproach && (
                    <span>
                      Design:{" "}
                      {lead.designApproach === "template"
                        ? "Template"
                        : "Custom"}
                    </span>
                  )}
                  <span>Scope: {lead.scope}</span>
                  <span>Complexity: {lead.complexity}</span>
                  <span>Timeline: {lead.timeline}</span>
                  <span className="col-span-2">
                    Budget: {lead.budgetDisplay}
                  </span>
                  {lead.deliverableSavingsUsd != null &&
                    lead.deliverableSavingsUsd.gt(0) && (
                      <span className="col-span-2">
                        Package savings: −
                        {formatUsdDecimal(lead.deliverableSavingsUsd)} USD
                      </span>
                    )}
                  {excludedLabels.length > 0 && (
                    <span className="col-span-2">
                      Removed: {excludedLabels.join(" · ")}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}

        {submission.feedback && (
          <div className="rounded border border-[#C8A96E]/20 bg-[#C8A96E]/5 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] tracking-wider text-[#C8A96E] uppercase">
                Consultation feedback
              </p>
              <Link
                href={`/admin/feedback/${submission.feedback.id}`}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                View detail →
              </Link>
            </div>
            <StarRating
              rating={submission.feedback.rating}
              size="md"
            />
            {submission.feedback.comment && (
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                {submission.feedback.comment}
              </p>
            )}
          </div>
        )}

        <InboxDetailPanel
          id={submission.id}
          isRead={submission.isRead}
          email={submission.email}
          name={submission.name}
          message={submission.message}
          status={submission.status}
          internalNotes={submission.internalNotes}
          source={submission.source}
        />
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
export const revalidate = 0;
