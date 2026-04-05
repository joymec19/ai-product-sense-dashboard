import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runCompetitiveChain } from '@/lib/llm/competitive'
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
    const result = await runCompetitiveChain({
      product_name: session.product_name, product_url: session.product_url,
      category: session.category, geography: session.geography,
      custom_competitors: session.custom_competitors, sessionId: params.sessionId,
    })

    // Persist competitors
    const competitorRows = result.extraction.competitors.map(c => ({
      session_id: params.sessionId, user_id: user.id, name: c.name,
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
        session_id: params.sessionId, competitor_id: compMap[p.competitor_name],
        axis_x_name: p.axis_x_name, axis_y_name: p.axis_y_name,
        score_x: p.score_x, score_y: p.score_y,
        moat_score: p.moat_score, moat_type: p.moat_type,
      })).filter(r => r.competitor_id)
      await sb.from('competitor_positioning').upsert(posRows, { onConflict: 'session_id,competitor_id' })

      // Feature matrix
      const featureRows = result.feature_matrix.features.flatMap(f =>
        Object.entries(f.scores).map(([compName, score]) => ({
          session_id: params.sessionId, competitor_id: compMap[compName],
          feature_name: f.feature_name, support_level: score.support_level,
          evidence_url: score.evidence,
        })).filter(r => r.competitor_id)
      )
      await sb.from('competitor_features').upsert(featureRows, { onConflict: 'session_id,competitor_id,feature_name' })
    }

    await sb.from('analysis_sessions').update({ status: 'complete', completed_at: new Date().toISOString() }).eq('id', params.sessionId)
    return NextResponse.json({ ok: true, competitors: result.extraction.competitors.length })

  } catch (err) {
    const kind = err instanceof LLMError ? err.kind : 'unknown'
    await sb.from('analysis_sessions').update({ status: 'failed', error_message: kind }).eq('id', params.sessionId)
    const status = kind === 'rate_limit' ? 429 : kind === 'timeout' ? 504 : 500
    return NextResponse.json({ error: kind }, { status })
  }
}
