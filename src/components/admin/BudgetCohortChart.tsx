"use client";

interface CohortItem {
  type: string;
  count: number;
}

interface BudgetCohortChartProps {
  data: CohortItem[];
}

export function BudgetCohortChart({ data }: BudgetCohortChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center border border-zinc-800 bg-[#0F0F0F] text-zinc-500">
        No project type cohort data available.
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Palettes for segments
  const colors = [
    "#C8A96E", // Premium Gold
    "#A3A3A3", // Neutral Gray
    "#8B7347", // Bronze/Gold
    "#52525B", // Zinc 500
    "#737373", // Zinc 400
    "#3F3F46", // Zinc 600
  ];

  // Map data to percentages and colors
  const segments = data
    .map((item, index) => {
      const percentage = total > 0 ? (item.count / total) * 100 : 0;
      return {
        type: item.type || "Other",
        count: item.count,
        percentage,
        color: colors[index % colors.length],
      };
    })
    .sort((a, b) => b.count - a.count); // Show largest first

  return (
    <div className="border border-zinc-800 bg-[#0F0F0F] p-6">
      <div className="mb-4">
        <h3 className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
          Project Type Distribution
        </h3>
        <p className="text-[10px] text-zinc-600">Breakdown of Lead Segments ({total} total)</p>
      </div>

      {/* Stacked Horizontal Bar */}
      <div className="relative mb-6 flex h-4 w-full overflow-hidden bg-zinc-900">
        {total === 0 ? (
          <div className="w-full bg-zinc-800" />
        ) : (
          segments.map((seg, idx) => (
            <div
              key={idx}
              className="h-full transition-all hover:opacity-90"
              style={{
                width: `${seg.percentage}%`,
                backgroundColor: seg.color,
              }}
              title={`${seg.type}: ${seg.count} (${seg.percentage.toFixed(1)}%)`}
            />
          ))
        )}
      </div>

      {/* Legend & Details */}
      <div className="grid grid-cols-1 gap-y-3 gap-x-6 sm:grid-cols-2">
        {segments.map((seg, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between text-xs border-b border-zinc-900/50 pb-1.5"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="font-medium text-zinc-300 capitalize">
                {seg.type.replace(/_/g, " ").toLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-zinc-100">{seg.count}</span>
              <span className="text-[10px] font-mono text-zinc-500">
                ({seg.percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
