"use client";

import type { CompetitorData } from "@/lib/types/dashboard";

interface CompetitorCardProps {
  competitor: CompetitorData;
  isHome?: boolean;
}

export default function CompetitorCard({ competitor, isHome }: CompetitorCardProps) {
  const { name, pricing, scores, featureSupport } = competitor;

  // Top 3 fully-supported features
  const topFeatures = Object.entries(featureSupport)
    .filter(([, status]) => status === "full")
    .slice(0, 3)
    .map(([feature]) => feature);

  const aiScore = scores.ai_sophistication ?? 0;

  const priceLabel = pricing.has_free_tier
    ? pricing.starting_price_usd
      ? `Free + $${pricing.starting_price_usd}/mo`
      : "Free"
    : pricing.starting_price_usd
    ? `From $${pricing.starting_price_usd}/mo`
    : pricing.model;

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-colors ${
        isHome
          ? "border-indigo-500/50 bg-indigo-500/5"
          : "border-zinc-800 bg-zinc-900"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
            {name}
            {isHome && (
              <span className="text-[10px] font-medium text-indigo-400 bg-indigo-400/10 px-1.5 py-0.5 rounded-full">
                You
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 capitalize">{priceLabel}</p>
        </div>

        {/* AI Sophistication score ring */}
        <div className="flex flex-col items-center shrink-0">
          <span
            className={`text-lg font-bold tabular-nums ${
              aiScore >= 7
                ? "text-emerald-400"
                : aiScore >= 4
                ? "text-yellow-400"
                : "text-red-400"
            }`}
          >
            {aiScore}
          </span>
          <span className="text-[9px] text-zinc-500 leading-tight text-center">
            AI
            <br />
            score
          </span>
        </div>
      </div>

      {/* Pricing badge */}
      <div className="flex items-center gap-2 text-xs">
        <span
          className={`px-2 py-0.5 rounded-full capitalize ${
            pricing.has_free_tier
              ? "text-emerald-400 bg-emerald-400/10"
              : "text-zinc-400 bg-zinc-800"
          }`}
        >
          {pricing.has_free_tier ? "Free tier" : "Paid only"}
        </span>
        <span className="text-zinc-500 capitalize">{pricing.model}</span>
      </div>

      {/* Top features */}
      {topFeatures.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topFeatures.map((f) => (
            <span
              key={f}
              className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700"
            >
              {f}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
