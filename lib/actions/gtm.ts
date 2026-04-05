'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { GTMPlan, GTMChannel, GTMExperiment } from '@/lib/types'

export async function getGTMPlan(sessionId: string): Promise<GTMPlan | null> {
  const sb = await createClient()
  const { data } = await sb.from('gtm_plans').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  return data as GTMPlan | null
}
export async function getGTMChannels(planId: string): Promise<GTMChannel[]> {
  const sb = await createClient()
  const { data } = await sb.from('gtm_channels').select('*').eq('gtm_plan_id', planId).order('priority')
  return (data ?? []) as GTMChannel[]
}
export async function getGTMExperiments(planId: string): Promise<GTMExperiment[]> {
  const sb = await createClient()
  const { data } = await sb.from('gtm_experiments').select('*').eq('gtm_plan_id', planId).order('priority')
  return (data ?? []) as GTMExperiment[]
}
export async function updateExperimentStatus(id: string, status: GTMExperiment['status'], sessionId: string) {
  const sb = await createClient()
  await sb.from('gtm_experiments').update({ status }).eq('id', id)
  revalidatePath(`/analysis/${sessionId}/gtm/experiments`)
}
