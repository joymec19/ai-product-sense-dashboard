// components/tabs/CompetitiveAnalysisTab.tsx
"use client";

import { useMemo, useState } from "react";
import { useAnalysis } from "@/lib/context/AnalysisContext";
import { useAnalysisData } from "@/hooks/useAnalysis";
import FeatureMatrix from "@/components/competitors/FeatureMatrix";
import RadarChart from "@/components/charts/RadarChart";
import PricingChart from "@/components/charts/PricingChart";
import PositioningMap from "@/components/charts/PositioningMap";
import StrengthsGapsTable from "@/components/competitive/StrengthsGapsTable";
import SentimentHeatmap from "@/components/competitive/SentimentHeatmap";
import MoatAssessment from "@/components/competitive/MoatAssessment";
import type { CompetitorData } from "@/lib/types/dashboard";

function TabSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-3">
          <div className="h-4 bg-zinc-800 rounded animate-pulse w-1/3" />
          <div className="h-6 bg-zinc-800 rounded animate-pulse" />
          <div className="h-6 bg-zinc-800 rounded animate-pulse w-4/5" />
        </div>
      ))}
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function PricingTierBadge({ competitor }: { competitor: CompetitorData }) {
  const { has_free_tier, model, starting_price_usd } = competitor.pricing;
  const label = has_free_tier
    ? "Freemium"
    : starting_price_usd === null || starting_price_usd === 0
    ? "Free"
    : starting_price_usd > 100
    ? "Enterprise"
    : "Paid";
  const cls =
    label === "Freemium"
      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      : label === "Free"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : label === "Enterprise"
      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
      : "bg-zinc-700 text-zinc-300 border-zinc-600";

  return (
    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {model || label}
    </span>
  );
}

function EnhancedCompetitorCard({ competitor }: { competitor: CompetitorData }) {
  const initial = competitor.name.charAt(0).toUpperCase();
  const topFeatures = Object.entries(competitor.featureSupport ?? {})
    .filter(([, v]) => v === "full")
    .slice(0, 3)
    .map(([k]) => k);
  const rating = competitor.ratings?.overall ?? competitor.ratings?.g2 ?? null;

  return (
    <div className="rounded-xl bg-zinc-800/50 border border-zinc-700 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-zinc-200">{competitor.name}</span>
            {competitor.founded && (
              <span className="text-xs text-zinc-500">est. {competitor.founded}</span>
            )}
          </div>
          <div className="mt-1">
            <PricingTierBadge competitor={competitor} />
          </div>
        </div>
      </div>

      {topFeatures.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {topFeatures.map((f) => (
            <span
              key={f}
              className="rounded-full bg-zinc-700 text-zinc-300 text-xs px-2 py-0.5"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      {rating !== null && (
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <span className="text-yellow-400">★</span>
          <span>{rating.toFixed(1)}</span>
          <span className="text-zinc-600">/ 10 G2</span>
        </div>
      )}

      {competitor.review_summary && (
        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
          {competitor.review_summary}
        </p>
      )}
    </div>
  );
}

export default function CompetitiveAnalysisTab() {
  const { analysisId } = useAnalysis();
  const { competitors, loading } = useAnalysisData(analysisId);
  const [gapsOnly, setGapsOnly] = useState(false);

  const allFeatures = useMemo(
    () =>
      Array.from(
        new Set(competitors.flatMap((c) => Object.keys(c.featureSupport ?? {})))
      ),
    [competitors]
  );

  // For "gaps only": features where at least one competitor lacks full support
  const filteredFeatures = useMemo(() => {
    if (!gapsOnly) return allFeatures;
    return allFeatures.filter((f) =>
      competitors.some((c) => (c.featureSupport?.[f] ?? "none") !== "full")
    );
  }, [allFeatures, competitors, gapsOnly]);

  if (loading) return <TabSkeleton />;

  const emptyState = (
    <div className="flex items-center justify-center h-32 text-sm text-zinc-500 italic">
      Run analysis to populate competitors
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* A1 — Competitor Profile Cards */}
      <SectionCard title="Competitor Profiles">
        {competitors.length === 0 ? (
          emptyState
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {competitors.map((c) => (
              <EnhancedCompetitorCard key={c.name} competitor={c} />
            ))}
          </div>
        )}
      </SectionCard>

      {/* A2 — Feature Comparison Matrix */}
      <SectionCard title="Feature Comparison Matrix">
        <div className="flex items-center justify-end mb-3">
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={gapsOnly}
              onChange={(e) => setGapsOnly(e.target.checked)}
              className="accent-indigo-500 rounded"
            />
            Gaps only
          </label>
        </div>
        <FeatureMatrix features={filteredFeatures} competitors={competitors} />
      </SectionCard>

      {/* A3 — Radar Chart */}
      <SectionCard title="Competitor Radar">
        <RadarChart competitors={competitors} />
      </SectionCard>

      {/* A4 — Positioning Map */}
      <SectionCard title="Positioning Map (2×2 Scatter)">
        <PositioningMap competitors={competitors} />
      </SectionCard>

      {/* A5 — Pricing Analysis */}
      <SectionCard title="Pricing Analysis">
        <PricingChart competitors={competitors} />
      </SectionCard>

      {/* A6 — Strengths & Gaps Table */}
      <SectionCard title="Strengths & Gaps">
        <StrengthsGapsTable competitors={competitors} />
      </SectionCard>

      {/* A7 — User Sentiment Heatmap */}
      <SectionCard title="User Sentiment Heatmap">
        <SentimentHeatmap competitors={competitors} />
      </SectionCard>

      {/* A8 — Competitive Moat Assessment */}
      <SectionCard title="Competitive Moat Assessment">
        <MoatAssessment competitors={competitors} />
      </SectionCard>
    </div>
  );
}
