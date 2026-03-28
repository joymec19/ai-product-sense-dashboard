// components/competitors/FeatureMatrix.tsx
"use client";

import { useState, useMemo } from "react";
import type { CompetitorData, SupportStatus } from "@/lib/types/dashboard";

interface FeatureMatrixProps {
  features: string[];
  competitors: CompetitorData[];
}

// ── Badge config per status ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  SupportStatus,
  { icon: string; label: string; className: string }
> = {
  full: {
    icon: "✓",
    label: "Supported",
    className: "text-emerald-400 bg-emerald-400/10",
  },
  partial: {
    icon: "~",
    label: "Partial",
    className: "text-yellow-400 bg-yellow-400/10",
  },
  none: {
    icon: "✗",
    label: "Not supported",
    className: "text-red-400 bg-red-400/10",
  },
};

function StatusBadge({ status }: { status: SupportStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      title={cfg.label}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${cfg.className}`}
    >
      {cfg.icon}
    </span>
  );
}

type SortDir = "asc" | "desc";

export default function FeatureMatrix({ features, competitors }: FeatureMatrixProps) {
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sortedFeatures = useMemo(() => {
    return [...features].sort((a, b) =>
      sortDir === "asc" ? a.localeCompare(b) : b.localeCompare(a)
    );
  }, [features, sortDir]);

  const toggleSort = () => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));

  // Coverage score per competitor: % of features with "full" support
  const coverageMap = useMemo(() => {
    return Object.fromEntries(
      competitors.map((c) => {
        const total = features.length;
        const full = features.filter((f) => c.featureSupport?.[f] === "full").length;
        return [c.name, total > 0 ? Math.round((full / total) * 100) : 0];
      })
    );
  }, [competitors, features]);

  if (!features.length || !competitors.length) {
    return (
      <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 flex items-center justify-center h-48">
        <p className="text-sm text-zinc-500">No feature data available.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
          Feature Matrix — P1
        </h2>
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span className={`${STATUS_CONFIG.full.className} px-2 py-0.5 rounded-full`}>
            ✓ Full
          </span>
          <span className={`${STATUS_CONFIG.partial.className} px-2 py-0.5 rounded-full`}>
            ~ Partial
          </span>
          <span className={`${STATUS_CONFIG.none.className} px-2 py-0.5 rounded-full`}>
            ✗ None
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-zinc-800/60">
              {/* Sortable feature column */}
              <th
                onClick={toggleSort}
                className="sticky left-0 z-10 bg-zinc-800/80 cursor-pointer select-none
                           text-left px-4 py-3 font-semibold text-zinc-300 whitespace-nowrap
                           hover:text-indigo-400 transition-colors min-w-[180px]"
              >
                Feature
                <span className="ml-1 text-zinc-500 text-xs">
                  {sortDir === "asc" ? "↑" : "↓"}
                </span>
              </th>
              {competitors.map((c) => (
                <th
                  key={c.name}
                  className="px-4 py-3 text-center font-semibold text-zinc-300 whitespace-nowrap min-w-[120px]"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{c.name}</span>
                    <span className="text-xs text-indigo-400 font-normal">
                      {coverageMap[c.name]}% covered
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedFeatures.map((feature, rowIdx) => (
              <tr
                key={feature}
                className={`
                  border-t border-zinc-800 transition-colors
                  ${rowIdx % 2 === 0 ? "bg-zinc-900" : "bg-zinc-800/30"}
                  hover:bg-indigo-500/5
                `}
              >
                {/* Sticky feature name cell */}
                <td className="sticky left-0 z-10 bg-inherit px-4 py-3 text-zinc-200 font-medium whitespace-nowrap">
                  {feature}
                </td>
                {competitors.map((c) => {
                  const status: SupportStatus = c.featureSupport?.[feature] ?? "none";
                  return (
                    <td key={c.name} className="px-4 py-3 text-center">
                      <StatusBadge status={status} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
