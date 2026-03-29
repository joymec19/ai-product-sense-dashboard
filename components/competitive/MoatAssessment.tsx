// components/competitive/MoatAssessment.tsx
"use client";

import type { CompetitorData } from "@/lib/types/dashboard";

interface MoatAssessmentProps {
  competitors: CompetitorData[];
}

const MOAT_DIMS: Array<{
  label: string;
  key: keyof NonNullable<CompetitorData["moat_scores"]>;
}> = [
  { label: "Switching Costs", key: "switching_costs" },
  { label: "Network Effects", key: "network_effects" },
  { label: "Data Advantages", key: "data_advantages" },
  { label: "Brand", key: "brand" },
];

function MiniProgress({ value, max = 10 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const color =
    pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full bg-zinc-700 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function MoatAssessment({ competitors }: MoatAssessmentProps) {
  if (!competitors.length) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-zinc-500">
        No competitor data available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {competitors.map((c) => {
        const moat = c.moat_scores;
        const defensibleInsight = (c.gaps ?? [])[0];
        return (
          <div
            key={c.name}
            className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4 space-y-3"
          >
            <h4 className="font-semibold text-zinc-200 text-sm">{c.name}</h4>
            <div className="space-y-2">
              {MOAT_DIMS.map(({ label, key }) => {
                const val = moat?.[key] ?? 0;
                return (
                  <div key={key}>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>{label}</span>
                      <span className="text-zinc-300 font-medium">{val}/10</span>
                    </div>
                    <MiniProgress value={val} />
                  </div>
                );
              })}
            </div>
            {defensibleInsight && (
              <p className="text-xs text-indigo-400 leading-relaxed border-t border-zinc-700 pt-2">
                {defensibleInsight}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
