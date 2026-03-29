// components/charts/RadarChart.tsx
"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { CompetitorData } from "@/lib/types/dashboard";

// ── Palette — cycles if more than 8 competitors ──────────────────────────────
const DEFAULT_COLORS = [
  "#818cf8", // indigo-400
  "#34d399", // emerald-400
  "#f472b6", // pink-400
  "#fb923c", // orange-400
  "#38bdf8", // sky-400
  "#a78bfa", // violet-400
  "#facc15", // yellow-400
  "#4ade80", // green-400
];

const AXES: Array<{ label: string; get: (c: CompetitorData) => number }> = [
  { label: "AI Sophistication", get: (c) => c.ai_sophistication ?? 0 },
  { label: "UX Score",          get: (c) => c.ux_score ?? 0 },
  { label: "Mobile Score",      get: (c) => c.mobile_score ?? 0 },
  { label: "Market Presence",   get: (c) => c.scores?.market_presence ?? 0 },
  { label: "Value for Money",   get: (c) => c.scores?.value_for_money ?? 0 },
];

interface RadarChartProps {
  competitors: CompetitorData[];
  homeProduct?: string; // must match a competitor's name exactly
}

// Recharts needs data shaped as [{ axis: "AI Sophistication", CompA: 7, CompB: 5 }]
function buildChartData(competitors: CompetitorData[]) {
  return AXES.map(({ label, get }) => {
    const entry: Record<string, string | number> = { axis: label };
    competitors.forEach((c) => {
      entry[c.name] = get(c);
    });
    return entry;
  });
}

// Custom tick so long labels don't overflow on small screens
function AxisTick({ x, y, payload }: { x: number | string; y: number | string; payload: { value: string } }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fill="#a1a1aa" // zinc-400
      fontSize={11}
      fontWeight={500}
    >
      {payload.value}
    </text>
  );
}

export default function RadarChart({ competitors, homeProduct }: RadarChartProps) {
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
        Competitor Radar
      </h2>
      <div className="h-[280px] sm:h-[360px] md:h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
          <PolarAngleAxis dataKey="axis" tick={(props) => <AxisTick {...props} />} />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: "#52525b", fontSize: 10 }}
            tickCount={6}
            stroke="#3f3f46"
          />
          {competitors.map((c, i) => {
            const isHome = c.name === homeProduct;
            const color = c.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
            return (
              <Radar
                key={c.name}
                name={c.name}
                dataKey={c.name}
                stroke={isHome ? "#6366f1" : color} // indigo-500 for home
                fill={isHome ? "#6366f1" : color}
                fillOpacity={isHome ? 0.25 : 0.08}
                strokeWidth={isHome ? 3 : 1.5}
                dot={isHome}
              />
            );
          })}
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              color: "#f4f4f5",
              fontSize: 13,
            }}
            formatter={(value: unknown, name: unknown) => [
              `${value} / 10`,
              name === homeProduct ? `${name} ★` : String(name),
            ]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span
                style={{
                  color: value === homeProduct ? "#6366f1" : "#a1a1aa",
                  fontWeight: value === homeProduct ? 700 : 400,
                  fontSize: 12,
                }}
              >
                {value === homeProduct ? `${value} (You)` : value}
              </span>
            )}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}
