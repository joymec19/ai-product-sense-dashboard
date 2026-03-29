// components/market/TrendFeed.tsx
"use client";

import { useState } from "react";

interface TrendFeedProps {
  category: string;
}

const SOURCES = ["TechCrunch", "Product Hunt", "a16z", "Gartner", "Forrester"];

function getPlaceholderTrends(category: string) {
  return [
    {
      headline: `${category} trends 2026: AI-first product orgs are shipping 3× faster`,
      source: SOURCES[0],
      date: "Mar 28, 2026",
      fresh: true,
    },
    {
      headline: `How PLG is reshaping ${category} adoption in enterprise`,
      source: SOURCES[1],
      date: "Mar 22, 2026",
      fresh: true,
    },
    {
      headline: `State of ${category} market: $12B opportunity by 2028`,
      source: SOURCES[2],
      date: "Mar 15, 2026",
      fresh: true,
    },
    {
      headline: `Incumbents vs challengers in ${category}: who wins the AI race`,
      source: SOURCES[3],
      date: "Feb 28, 2026",
      fresh: false,
    },
    {
      headline: `User expectations in ${category} are evolving faster than products`,
      source: SOURCES[4],
      date: "Feb 10, 2026",
      fresh: false,
    },
  ];
}

export default function TrendFeed({ category }: TrendFeedProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const trends = getPlaceholderTrends(category || "AI product");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500">Placeholder trends — live feed coming in V1.1</p>
        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="rounded-lg bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 px-3 py-1.5 hover:text-zinc-200 transition-colors"
          >
            Refresh Trends
          </button>
          {showTooltip && (
            <div className="absolute right-0 bottom-full mb-2 w-48 rounded-lg bg-zinc-700 border border-zinc-600 p-2 text-xs text-zinc-300 shadow-lg z-10">
              Coming in V1.1 — live trend API
            </div>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {trends.map((t, i) => (
          <div
            key={i}
            className="rounded-xl bg-zinc-800/50 border border-zinc-700 px-4 py-3 flex items-start gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-200 leading-snug">{t.headline}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="rounded-full bg-zinc-700 text-zinc-400 text-xs px-2 py-0.5">
                  {t.source}
                </span>
                <span className="text-xs text-zinc-600">{t.date}</span>
              </div>
            </div>
            {t.fresh && (
              <span className="flex-shrink-0 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5">
                &lt;90d
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
