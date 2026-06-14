"use client";

import { useState } from "react";

interface MonthlyData {
  month: string;
  revenue: number;
  leads: number;
}

interface MonthlyAnalyticsChartProps {
  data: MonthlyData[];
}

export function MonthlyAnalyticsChart({ data }: MonthlyAnalyticsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center border border-zinc-800 bg-[#0F0F0F] text-zinc-500">
        No monthly trend data available.
      </div>
    );
  }

  // Calculate maximums for scaling
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);
  const maxLeads = Math.max(...data.map((d) => d.leads), 5);

  // SVG configurations
  const width = 600;
  const height = 250;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const colWidth = chartWidth / data.length;
  const barWidth = Math.max(12, colWidth * 0.22);
  const barGap = 4;

  const handleMouseMove = (e: React.MouseEvent<SVGRectElement>, index: number) => {
    const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    
    if (svgRect) {
      // Calculate tooltip position relative to the SVG container
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top - 75; // show above cursor
      setTooltipPos({ x, y });
    }
    setHoveredIndex(index);
  };

  return (
    <div className="relative border border-zinc-800 bg-[#0F0F0F] p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-medium tracking-wider text-zinc-400 uppercase">
            Month-over-Month Performance
          </h3>
          <p className="text-[10px] text-zinc-600">Last 6 Months Trend</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 bg-[#C8A96E]" />
            <span className="text-zinc-400">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 bg-zinc-600" />
            <span className="text-zinc-400">Leads</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = paddingTop + chartHeight * (1 - ratio);
            return (
              <line
                key={i}
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#1A1A1A"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Render Bars */}
          {data.map((d, index) => {
            const colCenterX = paddingLeft + index * colWidth + colWidth / 2;

            // Scaled heights
            const revHeight = (d.revenue / maxRevenue) * chartHeight;
            const leadsHeight = (d.leads / maxLeads) * chartHeight;

            // Y coordinates
            const revY = paddingTop + chartHeight - revHeight;
            const leadsY = paddingTop + chartHeight - leadsHeight;

            // X coordinates for side-by-side bars
            const revX = colCenterX - barWidth - barGap / 2;
            const leadsX = colCenterX + barGap / 2;

            return (
              <g key={index}>
                {/* Revenue Bar */}
                <rect
                  x={revX}
                  y={revY}
                  width={barWidth}
                  height={Math.max(2, revHeight)}
                  fill={hoveredIndex === index ? "#D4AF37" : "#C8A96E"}
                  rx={2}
                  className="transition-all duration-200"
                />

                {/* Leads Bar */}
                <rect
                  x={leadsX}
                  y={leadsY}
                  width={barWidth}
                  height={Math.max(2, leadsHeight)}
                  fill={hoveredIndex === index ? "#8E8E93" : "#52525B"}
                  rx={2}
                  className="transition-all duration-200"
                />

                {/* Month Label */}
                <text
                  x={colCenterX}
                  y={height - 15}
                  textAnchor="middle"
                  fill="#71717A"
                  fontSize={10}
                  className="font-medium uppercase tracking-wider"
                >
                  {d.month}
                </text>

                {/* Hover trigger area */}
                <rect
                  x={paddingLeft + index * colWidth}
                  y={paddingTop}
                  width={colWidth}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseMove={(e) => handleMouseMove(e, index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              </g>
            );
          })}

          {/* Left Y Axis (Revenue) Labels */}
          <text
            x={10}
            y={paddingTop - 10}
            fill="#52525B"
            fontSize={9}
            textAnchor="start"
            className="font-medium uppercase tracking-wider"
          >
            Rev ($)
          </text>
          <text
            x={paddingLeft - 8}
            y={paddingTop + 4}
            fill="#71717A"
            fontSize={9}
            textAnchor="end"
          >
            ${maxRevenue >= 1000 ? `${(maxRevenue / 1000).toFixed(1)}k` : maxRevenue.toFixed(0)}
          </text>
          <text
            x={paddingLeft - 8}
            y={paddingTop + chartHeight / 2 + 4}
            fill="#71717A"
            fontSize={9}
            textAnchor="end"
          >
            ${(maxRevenue / 2) >= 1000 ? `${(maxRevenue / 2000).toFixed(1)}k` : (maxRevenue / 2).toFixed(0)}
          </text>
          <text
            x={paddingLeft - 8}
            y={paddingTop + chartHeight + 4}
            fill="#71717A"
            fontSize={9}
            textAnchor="end"
          >
            $0
          </text>

          {/* Bottom Border Line */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#27272A"
            strokeWidth={1}
          />
        </svg>

        {/* Interactive Tooltip Overlay */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-10 pointer-events-none rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs shadow-xl transition-all duration-75"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="font-semibold text-zinc-100 uppercase tracking-wider mb-1">
              {data[hoveredIndex].month}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Revenue:</span>
                <span className="font-mono text-[#C8A96E]">
                  ${data[hoveredIndex].revenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Leads:</span>
                <span className="font-mono text-zinc-300">
                  {data[hoveredIndex].leads}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
