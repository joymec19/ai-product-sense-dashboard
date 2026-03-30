"use client";
import useSWR from "swr";
import type { CompetitorData } from "@/lib/types/dashboard";
import type { PRDContent } from "@/lib/schemas/prd";

export interface AnalysisRow {
  id: string;
  category: string;
  category_input?: string;
  home_product_context?: string | null;
  market_scope?: string | null;
  status?: string | null;
  share_token?: string | null;
  created_at?: string;
}

export interface MarketDataRow {
  id?: string;
  analysis_id?: string;
  adjacent_markets?: string[];
  tam?: number | null;
  sam?: number | null;
  som?: number | null;
  growth_rate?: number | null;
}

// The DB row has extra fields beyond PRDContent (id, analysis_id, version, updated_at)
export type PRDRow = PRDContent & {
  id: string;
  analysis_id: string;
  version: number;
  updated_at?: string;
};

export interface UseAnalysisDataResult {
  analysis: AnalysisRow | null;
  competitors: CompetitorData[];
  prd: PRDRow | null;
  marketData: MarketDataRow | null;
  loading: boolean;
  error: string | null;
  mutate: () => void;
}

const fetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });

export function useAnalysisData(analysisId: string | undefined): UseAnalysisDataResult {
  const { data, error, isLoading, mutate } = useSWR(
    analysisId ? `/api/analysis/${analysisId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    analysis: data?.analysis ?? null,
    competitors: data?.competitors ?? [],
    prd: data?.prd ?? null,
    marketData: data?.market_data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
  };
}
