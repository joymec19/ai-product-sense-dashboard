import { createClient } from '@/lib/supabase/server'
import type {
  GTMPlan, GTMChannel, GTMExperiment,
  GTMMessaging, GTMLaunchPhase, GTMSuccessMetric,
  GTMStatus, ChannelType, Confidence, ExperimentPhase, ExperimentStatus, PricingModel,
} from '@/lib/types'

// Short aliases used by the GTM page components
export type GtmPlan         = GTMPlan
export type GtmMessaging    = GTMMessaging
export type GtmChannel      = GTMChannel
export type GtmExperiment   = GTMExperiment
export type LaunchPhase     = GTMLaunchPhase
export type SuccessMetric   = GTMSuccessMetric

export type GtmPlanPageData = {
  plan: GTMPlan
  channels: GTMChannel[]
  experiments: GTMExperiment[]
  messaging: GTMMessaging[]
  phases: GTMLaunchPhase[]
  metrics: GTMSuccessMetric[]
}

export type GTMPlanInput = {
  session_id: string
  positioning_statement?: string
  target_persona?: string
  icp_description?: string
  value_proposition?: string
  pricing_model?: PricingModel
  pricing_rationale?: string
  launch_date_target?: string
  status?: GTMStatus
}

export type GTMChannelInput = {
  gtm_plan_id: string
  channel_name: string
  channel_type?: ChannelType
  cac_usd?: number
  cac_source_url?: string
  cac_confidence?: Confidence
  target_signups?: number
  monthly_budget_usd?: number
  priority?: number
  rationale?: string
}

export type GTMExperimentInput = {
  gtm_plan_id: string
  hypothesis: string
  metric: string
  baseline_value?: number
  target_value?: number
  channel_id?: string
  duration_weeks?: number
  phase?: ExperimentPhase
  priority?: number
  status?: ExperimentStatus
  result_summary?: string
}

export async function createGTMPlan(input: GTMPlanInput): Promise<GTMPlan> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gtm_plans')
    .insert({ ...input, status: input.status ?? 'draft' })
    .select()
    .single()
  if (error) throw error
  return data as GTMPlan
}

export async function getGTMPlan(planId: string): Promise<GTMPlan | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gtm_plans')
    .select('*')
    .eq('id', planId)
    .single()
  if (error) return null
  return data as GTMPlan
}

export async function listGTMPlans(sessionId: string): Promise<GTMPlan[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gtm_plans')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
  return (data ?? []) as GTMPlan[]
}

export async function updateGTMPlan(
  planId: string,
  patch: Partial<GTMPlanInput>,
): Promise<GTMPlan> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gtm_plans')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', planId)
    .select()
    .single()
  if (error) throw error
  return data as GTMPlan
}

export async function getGTMChannels(planId: string): Promise<GTMChannel[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gtm_channels')
    .select('*')
    .eq('gtm_plan_id', planId)
    .order('priority')
  return (data ?? []) as GTMChannel[]
}

export async function getGTMExperiments(planId: string): Promise<GTMExperiment[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('gtm_experiments')
    .select('*')
    .eq('gtm_plan_id', planId)
    .order('priority')
  return (data ?? []) as GTMExperiment[]
}

export async function getGtmPlan(planId: string): Promise<GtmPlanPageData | null> {
  const supabase = await createClient()
  const { data: plan, error } = await supabase
    .from('gtm_plans').select('*').eq('id', planId).single()
  if (error || !plan) return null

  const [{ data: channels }, { data: experiments }, { data: messaging }, { data: phases }, { data: metrics }] =
    await Promise.all([
      supabase.from('gtm_channels').select('*').eq('gtm_plan_id', planId).order('priority'),
      supabase.from('gtm_experiments').select('*').eq('gtm_plan_id', planId).order('priority'),
      supabase.from('gtm_messaging').select('*').eq('session_id', plan.session_id),
      supabase.from('gtm_launch_phases').select('*').eq('session_id', plan.session_id).order('phase_order'),
      supabase.from('gtm_success_metrics').select('*').eq('session_id', plan.session_id),
    ])

  return {
    plan: plan as GTMPlan,
    channels: (channels ?? []) as GTMChannel[],
    experiments: (experiments ?? []) as GTMExperiment[],
    messaging: (messaging ?? []) as GTMMessaging[],
    phases: (phases ?? []) as GTMLaunchPhase[],
    metrics: (metrics ?? []) as GTMSuccessMetric[],
  }
}

export async function updateExperimentStatus(
  id: string,
  status: ExperimentStatus,
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('gtm_experiments')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}
