import { getAnalyticsSummary } from "@/actions/admin/analytics";
import { MonthlyAnalyticsChart } from "@/components/admin/MonthlyAnalyticsChart";
import { BudgetCohortChart } from "@/components/admin/BudgetCohortChart";

export async function AnalyticsSection() {
  const analytics = await getAnalyticsSummary(30);

  const maxInquiry = Math.max(
    1,
    ...analytics.inquiriesByDay.map((d) => d.count),
  );

  return (
    <section className="border border-zinc-800 bg-[#0F0F0F] p-8 space-y-8">
      <div>
        <span className="mb-2 block text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
          Analytics — Last 30 days
        </span>
        <h2 className="font-display text-lg font-light text-zinc-200">
          Executive Summary & Performance Trends
        </h2>
      </div>

      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
        <div className="border border-zinc-900 bg-zinc-950/40 p-4">
          <p className="text-2xl font-light text-[#C8A96E]">
            ${analytics.totalRevenue.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-1">Total Store Revenue</p>
        </div>
        <div className="border border-zinc-900 bg-zinc-950/40 p-4">
          <p className="text-2xl font-light text-zinc-100">
            ${analytics.averageBudget.toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-1">Avg Estimate Budget</p>
        </div>
        <div className="border border-zinc-900 bg-zinc-950/40 p-4">
          <p className="text-2xl font-light text-zinc-100">
            {analytics.inquiriesByDay.reduce((s, d) => s + d.count, 0)}
          </p>
          <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-1">Inquiries</p>
        </div>
        <div className="border border-zinc-900 bg-zinc-950/40 p-4">
          <p className="text-2xl font-light text-zinc-100">
            {analytics.totalLeads}
          </p>
          <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-1">Estimator leads</p>
        </div>
        <div className="border border-zinc-900 bg-zinc-950/40 p-4">
          <p className="text-2xl font-light text-[#C8A96E]">
            {analytics.conversionRate}%
          </p>
          <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-1">Lead conversion</p>
        </div>
        <div className="border border-zinc-900 bg-zinc-950/40 p-4">
          <p className="text-2xl font-light text-zinc-100">
            {analytics.convertedLeads}
          </p>
          <p className="text-[10px] tracking-wider text-zinc-500 uppercase mt-1">Converted leads</p>
        </div>
      </div>

      {/* Visual Chart Integration */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyAnalyticsChart data={analytics.monthlyTrend} />
        </div>
        <div>
          <BudgetCohortChart data={analytics.projectTypeBreakdown} />
        </div>
      </div>

      {/* Inquiries per day chart */}
      <div>
        <p className="mb-3 text-xs tracking-wider text-zinc-500 uppercase">
          Inquiries per day (Last 30 days)
        </p>
        <div className="flex h-24 items-end gap-1 bg-zinc-950/30 p-2 border border-zinc-900">
          {analytics.inquiriesByDay.map((day) => (
            <div
              key={day.day}
              className="flex-1 bg-[#C8A96E]/30 hover:bg-[#C8A96E]/50 transition-colors"
              style={{ height: `${(day.count / maxInquiry) * 100}%` }}
              title={`${day.day}: ${day.count}`}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs tracking-wider text-zinc-500 uppercase">
            Inquiry sources
          </p>
          <ul className="space-y-1.5 text-sm text-zinc-400">
            {analytics.sourceBreakdown.map((s) => (
              <li key={s.source} className="flex items-center justify-between border-b border-zinc-900 pb-1">
                <span className="capitalize">{s.source.toLowerCase()}</span>
                <span className="font-semibold text-zinc-200">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs tracking-wider text-zinc-500 uppercase">
            Lead funnel status
          </p>
          <ul className="space-y-1.5 text-sm text-zinc-400">
            {analytics.leadStatusBreakdown.map((s) => (
              <li key={s.status} className="flex items-center justify-between border-b border-zinc-900 pb-1">
                <span className="capitalize">{s.status.toLowerCase()}</span>
                <span className="font-semibold text-zinc-200">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

