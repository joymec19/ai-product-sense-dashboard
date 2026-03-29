// components/charts/PositioningMap.tsx
"use client";

import { useState, useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { CompetitorData } from "@/lib/types/dashboard";

type AxisOption =
  | "Intelligence"
  | "Simplicity"
  | "Price"
  | "Market Presence"
  | "Innovation"
  | "Ease of Use";

const AXIS_OPTIONS: AxisOption[] = [
  "Intelligence",
  "Simplicity",
  "Price",
  "Market Presence",
  "Innovation",
  "Ease of Use",
];

const AXIS_MAP: Record<AxisOption, (c: CompetitorData) => number> = {
  Intelligence: (c) => c.ai_sophistication ?? 0,
  Simplicity: (c) => c.ux_score ?? 0,
  Price: (c) => Math.min(c.pricing.starting_price_usd ?? 0, 100) / 10,
  "Market Presence": (c) => c.scores?.market_presence ?? 0,
  Innovation: (c) => c.scores?.innovation ?? 0,
  "Ease of Use": (c) => c.scores?.ease_of_use ?? 0,
};

const COLORS = [
  "#818cf8", "#34d399", "#f472b6", "#fb923c",
  "#38bdf8", "#a78bfa", "#facc15", "#4ade80",
];

interface PositioningMapProps {
  competitors: CompetitorData[];
}

interface DotEntry {
  x: number;
  y: number;
  name: string;
  r: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: DotEntry }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-xs text-zinc-200 shadow-lg">
      <p className="font-semibold mb-1">{d.name}</p>
      <p>X: {d.x.toFixed(1)}</p>
      <p>Y: {d.y.toFixed(1)}</p>
    </div>
  );
}

export default function PositioningMap({ competitors }: PositioningMapProps) {
  const [xAxis, setXAxis] = useState<AxisOption>("Intelligence");
  const [yAxis, setYAxis] = useState<AxisOption>("Simplicity");

  const data: DotEntry[] = useMemo(
    () =>
      competitors.map((c, i) => ({
        x: AXIS_MAP[xAxis](c),
        y: AXIS_MAP[yAxis](c),
        name: c.name,
        r: Math.max(4, Math.min(20, ((c.integration_count ?? 5) / 30) * 20 + 4)),
        color: c.color ?? COLORS[i % COLORS.length],
      })),
    [competitors, xAxis, yAxis]
  );

  if (!competitors.length) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-zinc-500">
        No competitor data available.
      </div>
    );
  }

  const selectClass =
    "rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-300 px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-500";

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-4">
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          X Axis:
          <select
            value={xAxis}
            onChange={(e) => setXAxis(e.target.value as AxisOption)}
            className={selectClass}
          >
            {AXIS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          Y Axis:
          <select
            value={yAxis}
            onChange={(e) => setYAxis(e.target.value as AxisOption)}
            className={selectClass}
          >
            {AXIS_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[0, 10]}
              name={xAxis}
              label={{ value: xAxis, position: "insideBottom", offset: -10, fill: "#71717a", fontSize: 11 }}
              tick={{ fill: "#71717a", fontSize: 10 }}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[0, 10]}
              name={yAxis}
              label={{ value: yAxis, angle: -90, position: "insideLeft", fill: "#71717a", fontSize: 11 }}
              tick={{ fill: "#71717a", fontSize: 10 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} isAnimationActive={false}>
              <LabelList dataKey="name" position="top" style={{ fontSize: 10, fill: "#a1a1aa" }} />
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.color} opacity={0.85} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
