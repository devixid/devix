import Link from "next/link";
import { notFound } from "next/navigation";
import { getEstimatorLeadById } from "@/actions/estimator-leads";
import LeadStatusActions from "@/components/admin/LeadStatusActions";
import { getExcludedLabelsForProjectType } from "@/lib/estimator-deliverables";
import type { ProjectType } from "@/types/estimator";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const lead = await getEstimatorLeadById(id);

  if (!lead) notFound();

  const excludedIds = Array.isArray(lead.excludedDeliverables)
    ? (lead.excludedDeliverables as string[])
    : [];
  const excludedLabels = getExcludedLabelsForProjectType(
    lead.projectType as ProjectType,
    excludedIds,
  );

  return (
    <div className="max-w-3xl space-y-8">
      <Link
        href="/admin/leads"
        className="inline-flex items-center gap-2 text-xs tracking-[0.2em] text-zinc-500 uppercase hover:text-zinc-300"
      >
        ← Back to Leads
      </Link>

      <div className="border border-zinc-800 bg-[#0F0F0F] p-8 md:p-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <span className="mb-2 block text-[10px] tracking-wider text-zinc-500 uppercase">
              Estimator Lead
            </span>
            <h1 className="font-display text-2xl font-light text-zinc-100 capitalize">
              {lead.projectType.replace(/_/g, " ")}
            </h1>
          </div>
          <span className="bg-zinc-800 px-3 py-1 text-[10px] font-medium tracking-wider text-zinc-300 uppercase">
            {lead.status}
          </span>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-6 border-b border-zinc-900 pb-8">
          {lead.designApproach && (
            <div>
              <span className="mb-1 block text-[10px] text-zinc-600 uppercase">
                Design
              </span>
              <span className="text-sm text-zinc-300 capitalize">
                {lead.designApproach === "template"
                  ? "Template Design"
                  : "Custom Design"}
              </span>
            </div>
          )}
          <div>
            <span className="mb-1 block text-[10px] text-zinc-600 uppercase">
              Scope
            </span>
            <span className="text-sm text-zinc-300">{lead.scope}</span>
          </div>
          <div>
            <span className="mb-1 block text-[10px] text-zinc-600 uppercase">
              Complexity
            </span>
            <span className="text-sm text-zinc-300">{lead.complexity}</span>
          </div>
          <div>
            <span className="mb-1 block text-[10px] text-zinc-600 uppercase">
              Timeline
            </span>
            <span className="text-sm text-zinc-300">{lead.timeline}</span>
          </div>
          {lead.platform && (
            <div>
              <span className="mb-1 block text-[10px] text-zinc-600 uppercase">
                Platform
              </span>
              <span className="text-sm text-zinc-300">{lead.platform}</span>
            </div>
          )}
          <div className="col-span-2">
            <span className="mb-1 block text-[10px] text-zinc-600 uppercase">
              Estimated Budget
            </span>
            <span className="text-xl font-light text-[#C8A96E]">
              {lead.budgetDisplay}
            </span>
            <span className="ml-2 text-xs text-zinc-500">
              (~${Math.round(lead.budgetUsd).toLocaleString()} USD)
            </span>
            {lead.deliverableSavingsUsd != null &&
              lead.deliverableSavingsUsd > 0 && (
                <p className="mt-1 text-xs text-zinc-500">
                  Package savings: −$
                  {Math.round(lead.deliverableSavingsUsd).toLocaleString()} USD
                </p>
              )}
          </div>
          {excludedLabels.length > 0 && (
            <div className="col-span-2">
              <span className="mb-1 block text-[10px] text-zinc-600 uppercase">
                Removed Deliverables
              </span>
              <ul className="list-inside list-disc text-sm text-zinc-400">
                {excludedLabels.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <span className="mb-1 block text-[10px] text-zinc-600 uppercase">
              Created
            </span>
            <span className="text-sm text-zinc-400">
              {new Date(lead.createdAt).toLocaleString()}
            </span>
          </div>
        </div>

        {lead.contactSubmission && (
          <div className="mb-8 rounded border border-zinc-800 bg-zinc-900/30 p-4">
            <p className="mb-2 text-[10px] tracking-wider text-zinc-500 uppercase">
              Linked Contact Submission
            </p>
            <Link
              href={`/admin/inbox/${lead.contactSubmission.id}`}
              className="text-sm text-[#C8A96E] hover:underline"
            >
              View inbox message from {lead.contactSubmission.name} →
            </Link>
          </div>
        )}

        <LeadStatusActions
          id={lead.id}
          status={lead.status}
        />
      </div>
    </div>
  );
}
