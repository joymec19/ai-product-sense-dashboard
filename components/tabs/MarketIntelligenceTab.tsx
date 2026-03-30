// components/tabs/MarketIntelligenceTab.tsx
"use client";

import { useAnalysis } from "@/lib/context/AnalysisContext";
import { useAnalysisData } from "@/hooks/useAnalysis";
import MarketSizingCalculator from "@/components/market/MarketSizingCalculator";
import TrendFeed from "@/components/market/TrendFeed";
import FundingTracker from "@/components/market/FundingTracker";
import AdjacentMarketMap from "@/components/market/AdjacentMarketMap";

function TabSkeleton() {
  return (
    <div className="p-6 space-y-4 max-w-4xl mx-auto">
      {[...Array(4)].map((_, i) => (
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

export default function MarketIntelligenceTab() {
  const { analysisId, analysisTitle } = useAnalysis();
  const { analysis, competitors, marketData, loading } = useAnalysisData(analysisId);

  if (loading) return <TabSkeleton />;

  const adjacentMarkets = marketData?.adjacent_markets ?? [];
  const category = analysis?.market_scope ?? analysisTitle;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* C1 — TAM/SAM/SOM Calculator */}
      <SectionCard title="TAM / SAM / SOM Calculator">
        <MarketSizingCalculator analysisId={analysisId} />
      </SectionCard>

      {/* C2 — Market Trend Feed */}
      <SectionCard title="Market Trend Feed">
        <TrendFeed category={category} />
      </SectionCard>

      {/* C3 — Funding Tracker */}
      <SectionCard title="Funding Tracker">
        <FundingTracker competitors={competitors} />
      </SectionCard>

      {/* C4 — Adjacent Market Map */}
      <SectionCard title="Adjacent Market Map">
        <AdjacentMarketMap
          analysisId={analysisId}
          category={category}
          adjacentMarkets={adjacentMarkets}
        />
      </SectionCard>
    </div>
  );
}
