// components/tabs/MarketIntelligenceTab.tsx
"use client";

import { useState, useEffect } from "react";
import { useAnalysis } from "@/lib/context/AnalysisContext";
import { supabase } from "@/lib/supabase";
import MarketSizingCalculator from "@/components/market/MarketSizingCalculator";
import TrendFeed from "@/components/market/TrendFeed";
import FundingTracker from "@/components/market/FundingTracker";
import AdjacentMarketMap from "@/components/market/AdjacentMarketMap";

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
  const { analysisId, competitors, analysisTitle } = useAnalysis();
  const [adjacentMarkets, setAdjacentMarkets] = useState<string[]>([]);

  useEffect(() => {
    if (!analysisId) return;
    supabase
      .from("market_data")
      .select("adjacent_markets")
      .eq("analysis_id", analysisId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.adjacent_markets) setAdjacentMarkets(data.adjacent_markets as string[]);
      });
  }, [analysisId]);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* C1 — TAM/SAM/SOM Calculator */}
      <SectionCard title="TAM / SAM / SOM Calculator">
        <MarketSizingCalculator analysisId={analysisId} />
      </SectionCard>

      {/* C2 — Market Trend Feed */}
      <SectionCard title="Market Trend Feed">
        <TrendFeed category={analysisTitle} />
      </SectionCard>

      {/* C3 — Funding Tracker */}
      <SectionCard title="Funding Tracker">
        <FundingTracker competitors={competitors} />
      </SectionCard>

      {/* C4 — Adjacent Market Map */}
      <SectionCard title="Adjacent Market Map">
        <AdjacentMarketMap
          analysisId={analysisId}
          category={analysisTitle}
          adjacentMarkets={adjacentMarkets}
        />
      </SectionCard>
    </div>
  );
}
