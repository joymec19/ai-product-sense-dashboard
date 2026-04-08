import { createClient } from '@/lib/supabase/server'
import type { MarketSizing, MarketTrend, BuyerPersona, RiskFactor } from '@/lib/types'
import type { MarketIntelligenceOutput } from '@/lib/llm/market'

export type MarketIntelligencePageData = {
  sizing: MarketSizing | null
  trends: MarketTrend[]
  personas: BuyerPersona[]
  risks: RiskFactor[]
}

export async function getMarketIntelligence(sessionId: string): Promise<MarketIntelligencePageData> {
  const supabase = await createClient()

  const [
    { data: sizingRows },
    { data: trendRows },
    { data: personaRows },
    { data: riskRows },
  ] = await Promise.all([
    supabase
      .from('market_sizing')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(1),
    supabase
      .from('market_trends')
      .select('*')
      .eq('session_id', sessionId)
      .order('relevance_score', { ascending: false }),
    supabase
      .from('market_buyer_personas')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true }),
    supabase
      .from('market_risk_factors')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true }),
  ])

  return {
    sizing: (sizingRows?.[0] as MarketSizing) ?? null,
    trends: (trendRows ?? []) as MarketTrend[],
    personas: (personaRows ?? []) as BuyerPersona[],
    risks: (riskRows ?? []) as RiskFactor[],
  }
}

export async function saveMarketIntelligence(
  sessionId: string,
  output: MarketIntelligenceOutput,
): Promise<void> {
  const supabase = await createClient()
  const now = new Date().toISOString()

  // Reconciled sizing
  const rec = output.sizing.reconciliation
  const approach = rec.preferred_approach === 'bottom_up' ? 'bottom_up' : 'top_down'
  const tamUsd = approach === 'bottom_up' ? output.sizing.bottom_up.tam_usd : output.sizing.top_down.tam_usd
  const samUsd = approach === 'bottom_up' ? output.sizing.bottom_up.sam_usd : output.sizing.top_down.sam_usd
  const somUsd = approach === 'bottom_up' ? output.sizing.bottom_up.som_usd : output.sizing.top_down.som_usd
  const tamSource = approach === 'bottom_up' ? 'Bottom-up model' : output.sizing.top_down.tam_source
  const samSource = approach === 'bottom_up' ? 'Bottom-up model' : output.sizing.top_down.sam_source
  const somSource = approach === 'bottom_up' ? 'Bottom-up model' : output.sizing.top_down.som_source

  // Delete stale sizing rows first (keep only latest per session)
  await supabase.from('market_sizing').delete().eq('session_id', sessionId)
  await supabase.from('market_sizing').insert({
    session_id: sessionId,
    approach,
    tam_usd: tamUsd,
    sam_usd: samUsd,
    som_usd: somUsd,
    tam_source: tamSource,
    sam_source: samSource,
    som_source: somSource,
    cagr_pct: output.sizing.cagr_pct,
    target_year: output.sizing.target_year,
    confidence: rec.confidence,
    llm_reasoning: rec.confidence_rationale,
    fetched_at: now,
    created_at: now,
    updated_at: now,
  })

  // Trends — delete then insert
  await supabase.from('market_trends').delete().eq('session_id', sessionId)
  if (output.trends.trends.length) {
    await supabase.from('market_trends').insert(
      output.trends.trends.map((t) => ({
        session_id: sessionId,
        trend_title: t.trend_title,
        trend_summary: t.trend_summary,
        signal_type: t.signal_type,
        sentiment: t.sentiment,
        relevance_score: t.relevance_score,
        fetched_at: now,
        created_at: now,
        updated_at: now,
      }))
    )
  }

  // Buyer personas — delete then insert
  await supabase.from('market_buyer_personas').delete().eq('session_id', sessionId)
  if (output.personas.personas.length) {
    await supabase.from('market_buyer_personas').insert(
      output.personas.personas.map((p) => ({
        session_id: sessionId,
        persona_name: p.persona_name,
        title: p.title,
        company_size: p.company_size,
        industry_verticals: p.industry_verticals,
        primary_job_to_be_done: p.primary_job_to_be_done,
        top_pains: p.top_pains,
        desired_outcomes: p.desired_outcomes,
        buying_triggers: p.buying_triggers,
        objections: p.objections,
        willingness_to_pay: p.willingness_to_pay,
        decision_making_role: p.decision_making_role,
        preferred_channels: p.preferred_channels,
        key_quote: p.key_quote,
        created_at: now,
        updated_at: now,
      }))
    )
  }

  // Risk factors — delete then insert
  await supabase.from('market_risk_factors').delete().eq('session_id', sessionId)
  if (output.risks.risks.length) {
    await supabase.from('market_risk_factors').insert(
      output.risks.risks.map((r) => ({
        session_id: sessionId,
        risk_title: r.risk_title,
        risk_type: r.risk_type,
        description: r.description,
        probability: r.probability,
        impact: r.impact,
        mitigation: r.mitigation,
        early_warning_signals: r.early_warning_signals,
        created_at: now,
        updated_at: now,
      }))
    )
  }
}
