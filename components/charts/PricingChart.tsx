// components/charts/PricingChart.tsx
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { CompetitorData } from "@/lib/types/dashboard";

interface PricingChartProps {
  competitors: CompetitorData[];
}

type ChartRow = {
  name: string;
  "Free Tier": number;
  "Paid ($/mo)": number;
  hasFree: boolean;
  pricingModel: string;
};

// Free tier represented as 0 for paid-only, or 1 for has_free_tier
function buildChartData(competitors: CompetitorData[]): ChartRow[] {
  return competitors.map((c) => ({
    name: c.name,
    "Free Tier": c.pricing.has_free_tier ? 1 : 0, // binary presence
    "Paid ($/mo)": c.pricing.starting_price_usd ?? 0,
    hasFree: c.pricing.has_free_tier,
    pricingModel: c.pricing.model,
  }));
}

// Format Y-axis ticks
function formatUSD(value: number) {
  if (value === 0) return "$0";
  return `$${value}`;
}

// Custom tooltip
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: ChartRow }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  return (
    <div className="rounded-xl bg-zinc-800 border border-zinc-700 px-4 py-3 text-xs text-zinc-200 shadow-xl space-y-1">
      <p className="font-semibold text-sm text-white">{label}</p>
      <p>
        Model:{" "}
        <span className="text-indigo-400 capitalize">{row?.pricingModel}</span>
      </p>
      <p>
        Free tier:{" "}
        <span className={row?.hasFree ? "text-emerald-400" : "text-red-400"}>
          {row?.hasFree ? "Yes" : "No"}
        </span>
      </p>
      <p>
        Starting price:{" "}
        <span className="text-zinc-100">
          {row?.["Paid ($/mo)"]
            ? `$${row["Paid ($/mo)"]}/mo`
            : "Undisclosed / Free-only"}
        </span>
      </p>
    </div>
  );
}

export default function PricingChart({ competitors }: PricingChartProps) {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex items-center justify-center h-48">
        <p className="text-sm text-zinc-500">No competitor data available.</p>
      </div>
    );
  }

  const data = buildChartData(competitors);

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
      <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
        Pricing Landscape
      </h2>
      <ResponsiveContainer width="100%" height={competitors.length > 5 ? 360 : 280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 40, left: 10, bottom: 4 }}
          barCategoryGap="28%"
          barGap={4}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#3f3f46"
            horizontal={false}
          />
          <XAxis
            type="number"
            tickFormatter={formatUSD}
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={{ stroke: "#3f3f46" }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fill: "#d4d4d8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#27272a" }} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span className="text-xs text-zinc-400">{value}</span>
            )}
          />
          {/* Free tier bar — binary (1 = exists) */}
          <Bar dataKey="Free Tier" fill="#34d399" radius={[0, 4, 4, 0]} maxBarSize={14}>
            {data.map((entry, index) => (
              <Cell
                key={`free-${index}`}
                fill={entry.hasFree ? "#34d399" : "#3f3f46"}
              />
            ))}
            <LabelList
              dataKey="hasFree"
              position="right"
              content={({ value, x, y, width, height }: { value?: unknown; x?: string | number; y?: string | number; width?: string | number; height?: string | number }) => {
                if (!value) return null;
                return (
                  <text
                    x={Number(x ?? 0) + Number(width ?? 0) + 6}
                    y={Number(y ?? 0) + Number(height ?? 0) / 2}
                    dominantBaseline="central"
                    fill="#34d399"
                    fontSize={10}
                  >
                    ✓ Free
                  </text>
                );
              }}
            />
          </Bar>
          {/* Paid tier starting price */}
          <Bar dataKey="Paid ($/mo)" fill="#6366f1" radius={[0, 4, 4, 0]} maxBarSize={14}>
            {data.map((entry, index) => (
              <Cell
                key={`paid-${index}`}
                fill={entry["Paid ($/mo)"] > 0 ? "#6366f1" : "#3f3f46"}
              />
            ))}
            <LabelList
              dataKey="Paid ($/mo)"
              position="right"
              content={({ value, x, y, width, height }: { value?: unknown; x?: string | number; y?: string | number; width?: string | number; height?: string | number }) => {
                const label = Number(value) > 0 ? `$${value}` : "N/A";
                return (
                  <text
                    x={Number(x ?? 0) + Number(width ?? 0) + 6}
                    y={Number(y ?? 0) + Number(height ?? 0) / 2}
                    dominantBaseline="central"
                    fill="#a5b4fc"
                    fontSize={10}
                  >
                    {label}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
