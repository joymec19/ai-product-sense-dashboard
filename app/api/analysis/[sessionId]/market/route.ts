import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runMarketChain } from '@/lib/llm/market'
import { LLMError } from '@/lib/LLMService'

export async function POST(_req: NextRequest, { params }: { params: { sessionId: string } }) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session } = await sb.from('analysis_sessions')
    .select('*').eq('id', params.sessionId).eq('user_id', user.id).single()
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  await sb.from('analysis_sessions').update({ status: 'running' }).eq('id', params.sessionId)

  try {
    const result = await runMarketChain({
      product_name: session.product_name, category: session.category,
      geography: session.geography, sessionId: params.sessionId,
    })

    // Persist market_sizing (one row per approach)
    const sizingRows = [
      {
        session_id: params.sessionId, approach: 'top_down',
        tam_usd: result.sizing.top_down.tam_usd,
        sam_usd: result.sizing.top_down.sam_usd,
        som_usd: result.sizing.top_down.som_usd,
        source: result.sizing.top_down.tam_source,
        rationale: result.sizing.top_down.tam_rationale,
        cagr_pct: result.sizing.cagr_pct,
        target_year: result.sizing.target_year,
        is_reconciled: false,
      },
      {
        session_id: params.sessionId, approach: 'bottom_up',
        tam_usd: result.sizing.bottom_up.tam_usd,
        sam_usd: result.sizing.bottom_up.sam_usd,
        som_usd: result.sizing.bottom_up.som_usd,
        source: result.sizing.bottom_up.methodology,
        rationale: result.sizing.bottom_up.methodology,
        cagr_pct: result.sizing.cagr_pct,
        target_year: result.sizing.target_year,
        is_reconciled: false,
      },
      {
        session_id: params.sessionId, approach: result.sizing.reconciliation.preferred_approach,
        tam_usd: result.sizing.reconciliation.reconciled_tam,
        sam_usd: result.sizing.reconciliation.reconciled_sam,
        som_usd: result.sizing.reconciliation.reconciled_som,
        source: result.sizing.reconciliation.confidence_rationale,
        rationale: result.sizing.reconciliation.confidence_rationale,
        cagr_pct: result.sizing.cagr_pct,
        target_year: result.sizing.target_year,
        is_reconciled: true,
      },
    ]
    await sb.from('market_sizing').upsert(sizingRows, { onConflict: 'session_id,approach,is_reconciled' })

    // Persist market_trends
    const trendRows = result.trends.trends.map(t => ({
      session_id: params.sessionId,
      title: t.trend_title,
      summary: t.trend_summary,
      signal_type: t.signal_type,
      sentiment: t.sentiment,
      relevance_score: t.relevance_score,
      time_horizon: t.time_horizon,
      impact_on_product: t.impact_on_product,
      supporting_signals: t.supporting_signals,
    }))
    await sb.from('market_trends').upsert(trendRows, { onConflict: 'session_id,title' })

    await sb.from('analysis_sessions').update({ status: 'complete', completed_at: new Date().toISOString() }).eq('id', params.sessionId)
    return NextResponse.json({ ok: true, trends: result.trends.trends.length })

  } catch (err) {
    const kind = err instanceof LLMError ? err.kind : 'unknown'
    await sb.from('analysis_sessions').update({ status: 'failed', error_message: kind }).eq('id', params.sessionId)
    const status = kind === 'rate_limit' ? 429 : kind === 'timeout' ? 504 : 500
    return NextResponse.json({ error: kind }, { status })
  }
}
