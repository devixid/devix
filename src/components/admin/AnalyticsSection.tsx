import { getAnalyticsSummary } from "@/actions/admin/analytics";

export async function AnalyticsSection() {
  const analytics = await getAnalyticsSummary(30);

  const maxInquiry = Math.max(
    1,
    ...analytics.inquiriesByDay.map((d) => d.count),
  );

  return (
    <section className="border border-zinc-800 bg-[#0F0F0F] p-8">
      <span className="mb-6 block text-[11px] font-medium tracking-wider text-zinc-500 uppercase">
        Analytics — Last 30 days
      </span>

      <div className="mb-8 grid grid-cols-2 gap-6 md:grid-cols-4">
        <div>
          <p className="text-2xl font-light text-zinc-100">
            {analytics.inquiriesByDay.reduce((s, d) => s + d.count, 0)}
          </p>
          <p className="text-xs text-zinc-500">Inquiries</p>
        </div>
        <div>
          <p className="text-2xl font-light text-zinc-100">
            {analytics.totalLeads}
          </p>
          <p className="text-xs text-zinc-500">Estimator leads</p>
        </div>
        <div>
          <p className="text-2xl font-light text-[#C8A96E]">
            {analytics.conversionRate}%
          </p>
          <p className="text-xs text-zinc-500">Lead conversion</p>
        </div>
        <div>
          <p className="text-2xl font-light text-zinc-100">
            {analytics.convertedLeads}
          </p>
          <p className="text-xs text-zinc-500">Converted leads</p>
        </div>
      </div>

      <div className="mb-8">
        <p className="mb-3 text-xs tracking-wider text-zinc-500 uppercase">
          Inquiries per day
        </p>
        <div className="flex h-24 items-end gap-1">
          {analytics.inquiriesByDay.map((day) => (
            <div
              key={day.day}
              className="flex-1 bg-[#C8A96E]/30 hover:bg-[#C8A96E]/50"
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
          <ul className="space-y-1 text-sm text-zinc-400">
            {analytics.sourceBreakdown.map((s) => (
              <li key={s.source}>
                {s.source}: {s.count}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-xs tracking-wider text-zinc-500 uppercase">
            Lead funnel
          </p>
          <ul className="space-y-1 text-sm text-zinc-400">
            {analytics.leadStatusBreakdown.map((s) => (
              <li key={s.status}>
                {s.status}: {s.count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
