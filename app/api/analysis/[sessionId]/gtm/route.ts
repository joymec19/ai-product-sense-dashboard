import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runGTMChain } from '@/lib/llm/gtm'

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';
import { LLMError } from '@/lib/LLMService'
import type { CompanyExtraction, PositioningMap } from '@/lib/llm/competitive'

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
    // Reconstruct competitive context from DB
    const { data: dbCompetitors } = await sb.from('competitors')
      .select('*, competitor_positioning(*)').eq('session_id', sessionId)

    let competitive_extraction: CompanyExtraction | undefined
    let competitive_positioning: PositioningMap | undefined

    if (dbCompetitors?.length) {
      competitive_extraction = {
        competitors: dbCompetitors.map(c => ({
          name: c.name,
          website: c.website ?? undefined,
          description: c.description ?? '',
          pricing_model: c.pricing_model ?? 'unknown',
          target_segment: c.target_segment ?? '',
          founded_year: c.founded_year ?? undefined,
          employee_range: undefined,
          funding_stage: c.funding_stage ?? undefined,
          key_differentiator: c.key_differentiator ?? '',
          source_confidence: 'medium' as const,
        })),
        market_context: '',
        direct_competitors: dbCompetitors.map(c => c.name),
        indirect_competitors: [],
      }

      const positioningRows = dbCompetitors.flatMap(c =>
        (c.competitor_positioning ?? []).map((p: Record<string, unknown>) => ({
          competitor_name: c.name,
          axis_x_name: p.axis_x_name as string,
          axis_y_name: p.axis_y_name as string,
          score_x: p.score_x as number,
          score_y: p.score_y as number,
          score_rationale: '',
          moat_score: p.moat_score as number,
          moat_type: (p.moat_type ?? 'none') as PositioningMap['primary_positioning'][number]['moat_type'],
          moat_rationale: '',
        }))
      )

      if (positioningRows.length) {
        competitive_positioning = {
          axes_suggestion: [],
          primary_positioning: positioningRows,
          empty_quadrant_opportunity: '',
        }
      }
    }

    const result = await runGTMChain({
      product_name: session.product_name, category: session.category,
      geography: session.geography, sessionId,
      competitive_extraction, competitive_positioning,
    })

    // Persist gtm_plans
    await sb.from('gtm_plans').upsert({
      session_id: sessionId,
      icp: result.icp,
      positioning_statement: result.positioning.positioning_statement,
      elevator_pitch: result.positioning.elevator_pitch,
      category_name: result.positioning.category_name,
      primary_motion: result.channels.primary_motion,
      total_monthly_budget_usd: result.channels.total_monthly_budget_usd,
      north_star_metric: result.metrics.north_star_metric,
      critical_path_item: result.launch_sequence.critical_path_item,
      soft_launch_weeks: result.launch_sequence.soft_launch_date_offset_weeks,
      public_launch_weeks: result.launch_sequence.public_launch_date_offset_weeks,
    }, { onConflict: 'session_id' })

    // Persist gtm_channels
    const channelRows = result.channels.channels.map(c => ({
      session_id: sessionId,
      channel_name: c.channel_name,
      channel_type: c.channel_type,
      motion: c.motion,
      cac_usd_estimate: c.cac_usd_estimate,
      monthly_budget_usd: c.monthly_budget_usd,
      expected_monthly_signups: c.expected_monthly_signups,
      time_to_first_result_weeks: c.time_to_first_result_weeks,
      priority: c.priority,
      rationale: c.rationale,
      tactics: c.tactics,
    }))
    await sb.from('gtm_channels').upsert(channelRows, { onConflict: 'session_id,channel_name' })

    // Persist gtm_experiments (launch phases)
    const experimentRows = result.launch_sequence.phases.map(p => ({
      session_id: sessionId,
      phase_number: p.phase_number,
      phase_name: p.phase_name,
      duration_weeks: p.duration_weeks,
      objective: p.objective,
      key_activities: p.key_activities,
      success_gate: p.success_gate,
      risks: p.risks,
      dependencies: p.dependencies,
      status: 'planned',
    }))
    await sb.from('gtm_experiments').upsert(experimentRows, { onConflict: 'session_id,phase_number' })

    // Persist gtm_messaging (messaging variants)
    const messagingRows = result.positioning.messaging_variants.map(v => ({
      session_id: sessionId,
      variant_label: v.variant_label,
      headline: v.headline,
      subheadline: v.subheadline,
      tone: v.tone,
      target_persona: v.target_persona,
    }))
    await sb.from('gtm_messaging').upsert(messagingRows, { onConflict: 'session_id,variant_label' })

    await sb.from('analysis_sessions').update({ status: 'complete', completed_at: new Date().toISOString() }).eq('id', sessionId)
    return NextResponse.json({ ok: true, channels: result.channels.channels.length })

  } catch (err) {
    const kind = err instanceof LLMError ? err.kind : 'unknown'
    await sb.from('analysis_sessions').update({ status: 'failed', error_message: kind }).eq('id', sessionId)
    const status = kind === 'rate_limit' ? 429 : kind === 'timeout' ? 504 : 500
    return NextResponse.json({ error: kind }, { status })
  }
}
