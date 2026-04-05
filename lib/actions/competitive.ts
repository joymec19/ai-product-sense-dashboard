'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Competitor, CompetitorFeature, CompetitorPositioning } from '@/lib/types'
import type { StrategicGap } from '@/lib/types/competitive'

export async function getCompetitors(sessionId: string): Promise<Competitor[]> {
  const sb = createClient()
  const { data } = await sb.from('competitors').select('*').eq('session_id', sessionId).order('created_at')
  return (data ?? []) as Competitor[]
}
export async function getCompetitorById(id: string): Promise<Competitor | null> {
  const sb = createClient()
  const { data } = await sb.from('competitors').select('*').eq('id', id).single()
  return data as Competitor | null
}
export async function getCompetitorFeatures(sessionId: string): Promise<CompetitorFeature[]> {
  const sb = createClient()
  const { data } = await sb.from('competitor_features').select('*').eq('session_id', sessionId)
  return (data ?? []) as CompetitorFeature[]
}
export async function getPositioningScores(sessionId: string): Promise<CompetitorPositioning[]> {
  const sb = createClient()
  const { data } = await sb.from('competitor_positioning').select('*').eq('session_id', sessionId)
  return (data ?? []) as CompetitorPositioning[]
}
export async function addCompetitor(sessionId: string, name: string, website?: string) {
  const sb = createClient()
  const { data: { user } } = await sb.auth.getUser()
  await sb.from('competitors').insert({ session_id: sessionId, user_id: user?.id, name, website, is_user_added: true })
  revalidatePath(`/analysis/${sessionId}/competitive`)
}

export async function getStrategicGaps(sessionId: string): Promise<StrategicGap[]> {
  const sb = createClient()
  const { data } = await sb
    .from('strategic_gaps')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at')
  return (data ?? []) as StrategicGap[]
}
