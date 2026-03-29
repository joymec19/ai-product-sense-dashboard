// components/competitive/StrengthsGapsTable.tsx
"use client";

import type { CompetitorData } from "@/lib/types/dashboard";

interface StrengthsGapsTableProps {
  competitors: CompetitorData[];
}

function Badge({ text, color }: { text: string; color: "emerald" | "red" | "indigo" }) {
  const cls = {
    emerald: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    red: "bg-red-400/10 text-red-400 border-red-400/20",
    indigo: "bg-indigo-400/10 text-indigo-400 border-indigo-400/20",
  }[color];
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {text}
    </span>
  );
}

export default function StrengthsGapsTable({ competitors }: StrengthsGapsTableProps) {
  if (!competitors.length) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-zinc-500">
        No competitor data available.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-zinc-800/60">
            <th className="px-4 py-3 text-left font-semibold text-zinc-300 whitespace-nowrap min-w-[140px]">
              Competitor
            </th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-300 min-w-[180px]">
              Strengths
            </th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-300 min-w-[180px]">
              Weaknesses
            </th>
            <th className="px-4 py-3 text-left font-semibold text-zinc-300 min-w-[200px]">
              Gap to Exploit
            </th>
          </tr>
        </thead>
        <tbody>
          {competitors.map((c, idx) => {
            const strengths = (c.strengths ?? []).slice(0, 3);
            const weaknesses = (c.weaknesses ?? []).slice(0, 3);
            const gap = (c.gaps ?? [])[0] ?? "—";
            return (
              <tr
                key={c.name}
                className={`border-t border-zinc-800 ${
                  idx % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/30"
                }`}
              >
                <td className="px-4 py-3 font-semibold text-zinc-200 whitespace-nowrap">
                  {c.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {strengths.length ? (
                      strengths.map((s) => <Badge key={s} text={s} color="emerald" />)
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {weaknesses.length ? (
                      weaknesses.map((w) => <Badge key={w} text={w} color="red" />)
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-indigo-400 text-xs leading-relaxed">{gap}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
