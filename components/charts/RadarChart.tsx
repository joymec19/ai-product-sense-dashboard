"use client";

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { Competitor } from "@/lib/schemas/competitor";

interface Props {
  competitors: Competitor[];
  tooltip?: string;
}

const COLORS = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#84cc16", "#06b6d4",
];

const DIMENSIONS = [
  { key: "market_presence", label: "Market Presence" },
  { key: "product_depth", label: "Product Depth" },
  { key: "ease_of_use", label: "Ease of Use" },
  { key: "value_for_money", label: "Value for Money" },
  { key: "innovation", label: "Innovation" },
];

export default function RadarChart({ competitors, tooltip }: Props) {
  if (!competitors || competitors.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No competitor data available.
      </div>
    );
  }

  const data = DIMENSIONS.map((dim) => {
    const point: Record<string, string | number> = { dimension: dim.label };
    competitors.forEach((c) => {
      point[c.name] = c.scores[dim.key as keyof typeof c.scores];
    });
    return point;
  });

  return (
    <div className="w-full">
      {tooltip && (
        <p className="mb-2 text-center text-xs text-muted-foreground italic">
          {tooltip}
        </p>
      )}
      <ResponsiveContainer width="100%" height={320}>
        <RechartsRadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 11 }} />
          <Tooltip />
          <Legend />
          {competitors.slice(0, 6).map((c, i) => (
            <Radar
              key={c.name}
              name={c.name}
              dataKey={c.name}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.1}
            />
          ))}
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  );
}
