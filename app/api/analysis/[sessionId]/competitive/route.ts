import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runCompetitiveChain } from '@/lib/llm/competitive'

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import { LLMError } from '@/lib/LLMService'
import { upsertStrategicGaps } from '@/lib/supabase/competitive'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params
  const sb = await createClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: session } = await sb.from('analysis_sessions')
    .select('*').eq('id', sessionId).eq('user_id', user.id).single()
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })

  await sb.from('analysis_sessions').update({ status: 'running' }).eq('id', sessionId)

  try {
    const result = await runCompetitiveChain({
      product_name: session.product_name, product_url: session.product_url,
      category: session.category, geography: session.geography,
      custom_competitors: session.custom_competitors, sessionId,
    })

    // Persist competitors
    const competitorRows = result.extraction.competitors.map(c => ({
      session_id: sessionId, user_id: user.id, name: c.name,
      website: c.website, description: c.description, pricing_model: c.pricing_model,
      target_segment: c.target_segment, founded_year: c.founded_year,
      funding_stage: c.funding_stage, is_user_added: false,
      staleness_score: 0, fetched_at: new Date().toISOString(), source_urls: [],
    }))
    const { data: insertedCompetitors } = await sb.from('competitors')
      .upsert(competitorRows, { onConflict: 'session_id,name' }).select()

    if (insertedCompetitors) {
      const compMap = Object.fromEntries(insertedCompetitors.map(c => [c.name, c.id]))

      // Positioning
      const posRows = result.positioning.primary_positioning.map(p => ({
        session_id: sessionId, competitor_id: compMap[p.competitor_name],
        axis_x_name: p.axis_x_name, axis_y_name: p.axis_y_name,
        score_x: p.score_x, score_y: p.score_y,
        moat_score: p.moat_score, moat_type: p.moat_type,
      })).filter(r => r.competitor_id)
      await sb.from('competitor_positioning').upsert(posRows, { onConflict: 'session_id,competitor_id' })

      // Feature matrix
      const featureRows = result.feature_matrix.features.flatMap(f =>
        Object.entries(f.scores).map(([compName, score]) => ({
          session_id: sessionId, competitor_id: compMap[compName],
          feature_name: f.feature_name, support_level: score.support_level,
          evidence_url: score.evidence,
        })).filter(r => r.competitor_id)
      )
      await sb.from('competitor_features').upsert(featureRows, { onConflict: 'session_id,competitor_id,feature_name' })
    }

    // Persist strategic gaps
    const gapRows = result.strategic_gaps.gaps.map(g => ({
      session_id: sessionId,
      user_id: user.id,
      gap_title: g.gap_title,
      gap_type: g.gap_type,
      description: g.description,
      addressable_by: g.addressable_by,
      urgency: g.urgency,
      market_size_signal: g.market_size_signal,
      evidence: g.evidence,
      white_space_summary: result.strategic_gaps.white_space_summary,
      recommended_focus: result.strategic_gaps.recommended_focus,
    }))
    await upsertStrategicGaps(sb, gapRows)

    await sb.from('analysis_sessions').update({ status: 'complete', completed_at: new Date().toISOString() }).eq('id', sessionId)
    return NextResponse.json({ ok: true, competitors: result.extraction.competitors.length })

  } catch (err) {
    const kind = err instanceof LLMError ? err.kind : 'unknown'
    await sb.from('analysis_sessions').update({ status: 'failed', error_message: kind }).eq('id', sessionId)
    const status = kind === 'rate_limit' ? 429 : kind === 'timeout' ? 504 : 500
    return NextResponse.json({ error: kind }, { status })
  }
}
