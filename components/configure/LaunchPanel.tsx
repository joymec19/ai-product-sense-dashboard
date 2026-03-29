"use client";

import type { AnalysisConfig } from "@/lib/types/dashboard";

interface LaunchPanelProps {
  config: AnalysisConfig;
  onLaunch: () => void;
  loading: boolean;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-zinc-700/50 last:border-0">
      <span className="w-36 shrink-0 text-sm text-zinc-500">{label}</span>
      <span className="text-sm text-zinc-200">{value || "—"}</span>
    </div>
  );
}

function contextLabel(ctx: AnalysisConfig["productContext"]): string {
  if (ctx.type === "file") {
    if (!ctx.content) return "File (empty)";
    if (ctx.content.startsWith("url:")) return ctx.content.slice(4) || "URL";
    return ctx.content.split("||")[0] || "File uploaded";
  }
  if (ctx.type === "questionnaire") {
    try {
      const q = JSON.parse(ctx.content || "{}");
      const filled = Object.values(q).filter(Boolean).length;
      return `Questionnaire (${filled} answers)`;
    } catch {
      return "Questionnaire answers";
    }
  }
  return "None";
}

export default function LaunchPanel({
  config,
  onLaunch,
  loading,
}: LaunchPanelProps) {
  return (
    <div className="space-y-5">
      {/* Summary card */}
      <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 space-y-0">
        <SummaryRow label="Category" value={config.category} />
        <SummaryRow
          label="Disambiguated as"
          value={config.disambiguated}
        />
        <SummaryRow
          label="Product context"
          value={contextLabel(config.productContext)}
        />
        <SummaryRow
          label="Geography"
          value={
            config.geography.length > 0
              ? config.geography.join(", ")
              : "Global (default)"
          }
        />
        <SummaryRow
          label="Segment"
          value={
            config.segment.length > 0
              ? config.segment.join(", ")
              : "All segments"
          }
        />
        <SummaryRow
          label="Competitors"
          value={
            config.customCompetitors.length > 0
              ? config.customCompetitors.join(", ")
              : "AI auto-selected"
          }
        />
      </div>

      {/* Launch button */}
      <button
        onClick={onLaunch}
        disabled={loading || !config.category.trim()}
        className="w-full rounded-xl bg-indigo-500 py-4 text-base font-semibold text-white transition-colors hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50 h-14"
        style={{ minHeight: 56 }}
      >
        {loading ? "Starting…" : "Run Analysis →"}
      </button>

      <p className="text-center text-sm text-zinc-500">~30–45 seconds</p>
    </div>
  );
}
