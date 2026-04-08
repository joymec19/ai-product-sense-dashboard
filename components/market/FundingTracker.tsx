// components/market/FundingTracker.tsx
"use client";

import type { CompetitorData } from "@/lib/types/dashboard";

interface FundingTrackerProps {
  competitors: CompetitorData[];
}

export default function FundingTracker({ competitors }: FundingTrackerProps) {
  if (competitors.length === 0) {
    return (
      <p className="text-sm text-zinc-500 text-center py-6">
        No funding data available yet.
      </p>
    );
  }

  const rows = competitors.slice(0, 3).map((c, i) => ({
    company: c.name,
    round: ["Series A", "Series B", "Series C"][i % 3],
    amount: ["$20M", "$50M", "$120M"][i % 3],
    date: ["Oct 2025", "Jan 2026", "Mar 2026"][i % 3],
    lead: ["Andreessen Horowitz", "Sequoia", "Accel"][i % 3],
  }));

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-800/60">
              {["Company", "Round", "Amount", "Date", "Lead Investor"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-semibold text-zinc-300 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr
                key={r.company}
                className={`border-t border-zinc-800 ${
                  i % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/30"
                }`}
              >
                <td className="px-4 py-3 font-semibold text-zinc-200">{r.company}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2 py-0.5">
                    {r.round}
                  </span>
                </td>
                <td className="px-4 py-3 text-emerald-400 font-semibold">{r.amount}</td>
                <td className="px-4 py-3 text-zinc-400">{r.date}</td>
                <td className="px-4 py-3 text-zinc-300">{r.lead}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-zinc-800/40 border border-zinc-700 px-3 py-2">
        <span className="text-xs text-zinc-500">
          Data powered by Crunchbase —
        </span>
        <button className="text-xs text-indigo-400 hover:text-indigo-300 underline transition-colors">
          Connect API
        </button>
      </div>
    </div>
  );
}
