// lib/supabase/competitive.ts — raw Supabase query helpers (accept client as param)
// Used by API routes and server actions to avoid repeated query boilerplate.
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Competitor, CompetitorFeature, CompetitorPositioning } from '@/lib/types'
import type { StrategicGap } from '@/lib/types/competitive'

export async function queryCompetitors(
  sb: SupabaseClient,
  sessionId: string,
): Promise<Competitor[]> {
  const { data } = await sb
    .from('competitors')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at')
  return (data ?? []) as Competitor[]
}

export async function queryCompetitorFeatures(
  sb: SupabaseClient,
  sessionId: string,
): Promise<CompetitorFeature[]> {
  const { data } = await sb
    .from('competitor_features')
    .select('*')
    .eq('session_id', sessionId)
  return (data ?? []) as CompetitorFeature[]
}

export async function queryPositioningScores(
  sb: SupabaseClient,
  sessionId: string,
): Promise<CompetitorPositioning[]> {
  const { data } = await sb
    .from('competitor_positioning')
    .select('*')
    .eq('session_id', sessionId)
  return (data ?? []) as CompetitorPositioning[]
}

export async function queryStrategicGaps(
  sb: SupabaseClient,
  sessionId: string,
): Promise<StrategicGap[]> {
  const { data } = await sb
    .from('strategic_gaps')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at')
  return (data ?? []) as StrategicGap[]
}

export async function upsertStrategicGaps(
  sb: SupabaseClient,
  gaps: Omit<StrategicGap, 'id' | 'created_at' | 'updated_at'>[],
): Promise<void> {
  if (!gaps.length) return
  await sb
    .from('strategic_gaps')
    .upsert(gaps, { onConflict: 'session_id,gap_title' })
}
