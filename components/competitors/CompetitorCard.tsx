"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CompetitorData } from "@/lib/types/dashboard";

interface CompetitorCardProps {
  competitor: CompetitorData;
  isHome?: boolean;
}

function CompetitorCardSkeleton() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1.5">
          <div className="h-4 w-32 animate-pulse rounded bg-zinc-800" />
          <div className="h-3 w-20 animate-pulse rounded bg-zinc-800" />
        </div>
        <div className="h-8 w-8 animate-pulse rounded bg-zinc-800" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-zinc-800" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-20 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-5 w-16 animate-pulse rounded-full bg-zinc-800" />
        <div className="h-5 w-24 animate-pulse rounded-full bg-zinc-800" />
      </div>
    </div>
  );
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
      className={cn(
        "rounded-xl border p-4 space-y-3 transition-colors",
        isHome
          ? "border-indigo-500/40 bg-indigo-500/5"
          : "border-zinc-800 bg-zinc-900"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
            {name}
            {isHome && <Badge variant="indigo">You</Badge>}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5 capitalize">{priceLabel}</p>
        </div>

        {/* AI Sophistication score */}
        <div className="flex flex-col items-center shrink-0">
          <span
            className={cn(
              "text-lg font-bold tabular-nums",
              aiScore >= 7
                ? "text-emerald-400"
                : aiScore >= 4
                ? "text-yellow-400"
                : "text-red-400"
            )}
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

      {/* Pricing badges */}
      <div className="flex items-center gap-2">
        <Badge variant={pricing.has_free_tier ? "success" : "default"}>
          {pricing.has_free_tier ? "Free tier" : "Paid only"}
        </Badge>
        <Badge variant="default" className="capitalize">
          {pricing.model}
        </Badge>
      </div>

      {/* Top features */}
      {topFeatures.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topFeatures.map((f) => (
            <Badge key={f} variant="default">
              {f}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export { CompetitorCardSkeleton };
