// components/competitive/SentimentHeatmap.tsx
"use client";

import type { CompetitorData } from "@/lib/types/dashboard";

const DIMS = [
  "Onboarding",
  "AI Quality",
  "Mobile",
  "Pricing",
  "Support",
  "Integrations",
] as const;

type Dim = (typeof DIMS)[number];

const POS_KW = ["easy", "great", "love", "fast", "intuitive", "excellent", "smooth", "best"];
const NEG_KW = ["slow", "bug", "expensive", "confusing", "missing", "poor", "difficult", "broken"];

type Sentiment = "positive" | "negative" | "neutral" | "unknown";

function scoreDim(reviewSummary: string | undefined, dim: Dim): Sentiment {
  if (!reviewSummary) return "unknown";
  const text = (reviewSummary + " " + dim).toLowerCase();
  const pos = POS_KW.some((w) => text.includes(w));
  const neg = NEG_KW.some((w) => text.includes(w));
  if (pos && !neg) return "positive";
  if (neg && !pos) return "negative";
  if (pos && neg) return "neutral";
  return "unknown";
}

const SENTIMENT_STYLE: Record<Sentiment, { cell: string; label: string; dot: string }> = {
  positive: {
    cell: "bg-emerald-500/15",
    label: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  negative: {
    cell: "bg-red-500/15",
    label: "text-red-400",
    dot: "bg-red-400",
  },
  neutral: {
    cell: "bg-yellow-500/15",
    label: "text-yellow-400",
    dot: "bg-yellow-400",
  },
  unknown: {
    cell: "bg-zinc-800",
    label: "text-zinc-600",
    dot: "bg-zinc-600",
  },
};

const SENTIMENT_ICON: Record<Sentiment, string> = {
  positive: "▲",
  negative: "▼",
  neutral: "●",
  unknown: "—",
};

interface SentimentHeatmapProps {
  competitors: CompetitorData[];
}

export default function SentimentHeatmap({ competitors }: SentimentHeatmapProps) {
  if (!competitors.length) {
    return (
      <div className="flex items-center justify-center h-24 text-sm text-zinc-500">
        No competitor data available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
        {(["positive", "negative", "neutral", "unknown"] as Sentiment[]).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${SENTIMENT_STYLE[s].dot}`} />
            {s}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-zinc-800/60">
              <th className="px-4 py-3 text-left font-semibold text-zinc-300 whitespace-nowrap min-w-[140px]">
                Competitor
              </th>
              {DIMS.map((d) => (
                <th
                  key={d}
                  className="px-3 py-3 text-center font-semibold text-zinc-300 whitespace-nowrap min-w-[90px]"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {competitors.map((c) => (
              <tr key={c.name} className="border-t border-zinc-800">
                <td className="px-4 py-3 font-semibold text-zinc-200 whitespace-nowrap bg-zinc-900">
                  {c.name}
                </td>
                {DIMS.map((dim) => {
                  const sentiment = scoreDim(c.review_summary, dim);
                  const style = SENTIMENT_STYLE[sentiment];
                  return (
                    <td
                      key={dim}
                      className={`px-3 py-3 text-center ${style.cell}`}
                      title={`${c.name} — ${dim}: ${sentiment}`}
                    >
                      <span className={`font-bold ${style.label}`}>
                        {SENTIMENT_ICON[sentiment]}
                      </span>
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
