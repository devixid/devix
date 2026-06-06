import Link from "next/link";
import { getEstimatorLeads } from "@/actions/estimator-leads";
import { LeadsSearch } from "@/components/admin/LeadsSearch";

export const metadata = {
  title: "Estimator Leads — Devix Operations",
};

interface Props {
  searchParams: Promise<{
    status?: string;
    query?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: Props) {
  const { status, query, dateFrom, dateTo } = await searchParams;
  const leads = await getEstimatorLeads({
    status: status as "NEW" | "CONTACTED" | "CONVERTED" | "CLOSED" | "all" | undefined,
    query,
    dateFrom,
    dateTo,
  });

  return (
    <div className="space-y-10">
      <div>
        <span className="mb-3 block text-[11px] font-medium tracking-[0.25em] text-zinc-500 uppercase">
          Estimator
        </span>
        <h1 className="font-display text-3xl font-light tracking-wide text-zinc-100">
          Estimator Leads
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Track project estimates generated from the pricing calculator.
        </p>
      </div>

      <LeadsSearch />

      <div className="divide-y divide-zinc-900 border border-zinc-800 bg-[#0F0F0F]">
        {leads.length === 0 ? (
          <div className="p-12 text-center text-sm text-zinc-500">
            No estimator leads match your filters.
          </div>
        ) : (
          leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/admin/leads/${lead.id}`}
              className="group flex flex-col justify-between gap-4 p-6 transition-colors hover:bg-[#121212] md:flex-row md:items-center"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="bg-zinc-800 px-2 py-0.5 text-[9px] font-medium tracking-wider text-zinc-400 uppercase">
                    {lead.status}
                  </span>
                  <span className="text-sm font-medium text-zinc-200 group-hover:text-[#C8A96E]">
                    {lead.projectType.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">
                  {lead.designApproach === "template"
                    ? "Template · "
                    : lead.designApproach === "custom"
                      ? "Custom · "
                      : ""}
                  {lead.scope} · {lead.complexity} · {lead.timeline}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-[#C8A96E]">
                  {lead.budgetDisplay}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
