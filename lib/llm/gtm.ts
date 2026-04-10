import { z } from 'zod'
import { getLLMService } from '../LLMService'
import { createHash } from 'crypto'
import type { BuyerPersonaOutput } from './market'
import type { CompanyExtraction, PositioningMap } from './competitive'

export const ICPSchema = z.object({
  firmographics: z.object({
    company_sizes: z.array(z.string()).min(1),
    industries: z.array(z.string()).min(1).max(6),
    geographies: z.array(z.string()).min(1),
    tech_stack_signals: z.array(z.string()).max(8),
    exclude_signals: z.array(z.string()).max(5),
  }),
  psychographics: z.object({
    growth_stage: z.array(z.enum(['pre_pmf','post_pmf','scaling','enterprise'])),
    buying_culture: z.enum(['self_serve','committee','champion_led','top_down']),
    pain_urgency: z.enum(['urgent','moderate','latent']),
  }),
  economic_profile: z.object({
    annual_budget_range_usd: z.string(),
    payback_period_expectation: z.string(),
    success_metric: z.string(),
  }),
  champion_profile: z.object({
    title: z.string(), department: z.string(),
    why_they_care: z.string().max(200),
    how_to_reach: z.string().max(200),
  }),
  qualification_score_criteria: z.array(z.object({
    criterion: z.string(), weight: z.number().min(0).max(1),
    positive_signal: z.string(), negative_signal: z.string(),
  })).min(3).max(7),
  icp_narrative: z.string().max(500),
})
export type ICPDefinition = z.infer<typeof ICPSchema>

export const PositioningStatementSchema = z.object({
  positioning_statement: z.string().max(300),
  elevator_pitch: z.string().max(150),
  category_name: z.string(),
  key_differentiators: z.array(z.string()).min(2).max(4),
  proof_points: z.array(z.string()).min(2).max(4),
  messaging_variants: z.array(z.object({
    variant_label: z.string(), headline: z.string().max(100),
    subheadline: z.string().max(200),
    tone: z.enum(['professional','casual','technical','aspirational']),
    target_persona: z.string(),
  })).min(3).max(5),
  competitive_displacement_angle: z.string().max(300),
})
export type PositioningStatement = z.infer<typeof PositioningStatementSchema>

export const ChannelStrategySchema = z.object({
  channels: z.array(z.object({
    channel_name: z.string(),
    channel_type: z.enum(['paid','organic','product','partnerships','events','community']),
    motion: z.enum(['plg','slg','hybrid']),
    cac_usd_estimate: z.number().positive(),
    cac_confidence: z.enum(['low','medium','high']),
    cac_benchmark_source: z.string(),
    monthly_budget_usd: z.number().positive(),
    expected_monthly_signups: z.number().int().positive(),
    time_to_first_result_weeks: z.number().int().positive(),
    priority: z.number().int().min(1).max(5),
    rationale: z.string().max(300),
    tactics: z.array(z.string()).min(2).max(5),
  })).min(3).max(8),
  total_monthly_budget_usd: z.number().positive(),
  primary_motion: z.enum(['plg','slg','hybrid']),
  channel_mix_rationale: z.string().max(400),
})
export type ChannelStrategy = z.infer<typeof ChannelStrategySchema>

export const LaunchSequenceSchema = z.object({
  phases: z.array(z.object({
    phase_name: z.string(), phase_number: z.number().int().min(1).max(6),
    duration_weeks: z.number().int().min(1).max(26),
    objective: z.string().max(200),
    key_activities: z.array(z.string()).min(3).max(8),
    success_gate: z.string().max(200),
    risks: z.array(z.string()).max(3),
    dependencies: z.array(z.string()).max(3),
  })).min(3).max(6),
  total_weeks: z.number().int().positive(),
  critical_path_item: z.string().max(200),
  soft_launch_date_offset_weeks: z.number().int().positive(),
  public_launch_date_offset_weeks: z.number().int().positive(),
})
export type LaunchSequence = z.infer<typeof LaunchSequenceSchema>

export const SuccessMetricsSchema = z.object({
  north_star_metric: z.object({
    name: z.string(), definition: z.string().max(200),
    measurement_method: z.string().max(200),
    target_at_6_months: z.string(), target_at_12_months: z.string(),
  }),
  kpis: z.array(z.object({
    metric_name: z.string(),
    category: z.enum(['acquisition','activation','retention','revenue','referral','product']),
    formula: z.string(), baseline: z.string(),
    target_30d: z.string(), target_90d: z.string(), target_180d: z.string(),
    data_source: z.string(), owner: z.string(),
  })).min(6).max(14),
  okrs: z.array(z.object({
    objective: z.string().max(150),
    key_results: z.array(z.string()).min(2).max(4),
    time_horizon: z.enum(['q1','q2','h1','h2','annual']),
  })).min(2).max(4),
  failure_signals: z.array(z.object({
    signal: z.string(), threshold: z.string(),
    response_action: z.string().max(200),
  })).min(3).max(6),
})
export type SuccessMetrics = z.infer<typeof SuccessMetricsSchema>

export interface GTMStrategyOutput {
  icp: ICPDefinition; positioning: PositioningStatement
  channels: ChannelStrategy; launch_sequence: LaunchSequence; metrics: SuccessMetrics
}

const GTM_SYSTEM = `You are a B2B GTM strategist with experience taking SaaS products from 0 to $10M ARR. Deep expertise in ICP definition, category design, PLG, and growth channels.

Rules:
- CAC estimates must be grounded in real benchmarks for the channel and segment. Cite the benchmark source.
- Positioning must reflect genuine differentiation, not aspirational claims.
- Launch phases must be sequenced realistically — do not compress timelines.
- Metrics must be measurable with standard analytics tools (Mixpanel, Amplitude, Stripe).
- Respond ONLY with valid JSON matching the requested schema.`

export function buildICPPrompt(input: { product_name: string; category?: string; geography?: string; personas?: BuyerPersonaOutput }): string {
  const hints = input.personas?.personas.slice(0, 2).map(p => `${p.persona_name} (${p.title}): ${p.primary_job_to_be_done}`).join('\n') ?? ''
  return `Define the ICP for: ${input.product_name}
${input.category ? `Category: ${input.category}` : ''}
${input.geography ? `Geography: ${input.geography}` : ''}
${hints ? `Persona hints:\n${hints}` : ''}

Define firmographics, psychographics, economic profile, champion profile, and 3–6 qualification criteria with weights.
Return JSON matching the ICP schema exactly.`
}

export function buildPositioningStatementPrompt(input: { product_name: string; icp: ICPDefinition; competitive_positioning?: PositioningMap; competitive_extraction?: CompanyExtraction }): string {
  const compNames = input.competitive_extraction?.direct_competitors?.slice(0, 3).join(', ') ?? 'known alternatives'
  return `Create positioning for: ${input.product_name}
ICP: ${input.icp.icp_narrative}
Champion: ${input.icp.champion_profile.title}
Competitors: ${compNames}
${input.competitive_positioning?.empty_quadrant_opportunity ? `White space: ${input.competitive_positioning.empty_quadrant_opportunity}` : ''}

Write a positioning statement (Geoffrey Moore format), elevator pitch, category name, key differentiators, proof points, 3–5 messaging variants, and competitive displacement angle.
Return JSON matching the PositioningStatement schema exactly.`
}

export function buildChannelStrategyPrompt(input: { product_name: string; icp: ICPDefinition; positioning: PositioningStatement }): string {
  return `Design GTM channels for: ${input.product_name}
Buying culture: ${input.icp.psychographics.buying_culture}
Champion reached via: ${input.icp.champion_profile.how_to_reach}
Pitch: ${input.positioning.elevator_pitch}

Recommend 3–7 channels. For each: provide a REAL CAC benchmark with source, monthly budget for meaningful signal, expected monthly signups, and 2–5 specific tactics.
Return JSON matching the ChannelStrategy schema exactly.`
}

export function buildLaunchSequencePrompt(input: { product_name: string; icp: ICPDefinition; positioning: PositioningStatement; channels: ChannelStrategy }): string {
  const topChannels = input.channels.channels.sort((a, b) => a.priority - b.priority).slice(0, 3).map(c => c.channel_name).join(', ')
  return `Design launch sequence for: ${input.product_name}
Primary channels: ${topChannels}
Motion: ${input.channels.primary_motion}

Design 3–5 phases (Alpha → Beta → Soft Launch → Public → Scale).
For each phase: objective, key activities, success gate, risks, dependencies.
Return JSON matching the LaunchSequence schema exactly.`
}

export function buildSuccessMetricsPrompt(input: { product_name: string; channels: ChannelStrategy; icp: ICPDefinition }): string {
  return `Define success metrics for: ${input.product_name}
North star candidate: ${input.icp.economic_profile.success_metric}
Motion: ${input.channels.primary_motion}

1. One north star metric with 6/12-month targets.
2. 6–12 AARRR KPIs with 30/90/180-day targets.
3. 2–4 OKRs for H1.
4. 3–5 failure signals with pivot-triggering thresholds.
Return JSON matching the SuccessMetrics schema exactly.`
}

export async function runGTMChain(input: {
  product_name: string; category?: string; geography?: string; sessionId: string
  personas?: BuyerPersonaOutput; competitive_positioning?: PositioningMap; competitive_extraction?: CompanyExtraction
}): Promise<GTMStrategyOutput> {
  const llm = getLLMService()
  const cb = createHash('sha256').update(`${input.product_name}:${input.category ?? ''}:${input.sessionId}`).digest('hex').slice(0, 16)

  const icp = await llm.call(GTM_SYSTEM, buildICPPrompt(input), ICPSchema, { cacheKey: `gtm:icp:${cb}`, cacheTtlSeconds: 86400, maxTokens: 3000 })
  const positioning = await llm.call(GTM_SYSTEM, buildPositioningStatementPrompt({
    product_name: input.product_name,
    icp,
    ...(input.competitive_positioning !== undefined && { competitive_positioning: input.competitive_positioning }),
    ...(input.competitive_extraction !== undefined && { competitive_extraction: input.competitive_extraction }),
  }), PositioningStatementSchema, { cacheKey: `gtm:positioning:${cb}`, cacheTtlSeconds: 86400 })
  const channels = await llm.call(GTM_SYSTEM, buildChannelStrategyPrompt({ product_name: input.product_name, icp, positioning }), ChannelStrategySchema, { cacheKey: `gtm:channels:${cb}`, cacheTtlSeconds: 86400, maxTokens: 4000 })
  const launch_sequence = await llm.call(GTM_SYSTEM, buildLaunchSequencePrompt({ product_name: input.product_name, icp, positioning, channels }), LaunchSequenceSchema, { cacheKey: `gtm:launch:${cb}`, cacheTtlSeconds: 86400 })
  const metrics = await llm.call(GTM_SYSTEM, buildSuccessMetricsPrompt({ product_name: input.product_name, channels, icp }), SuccessMetricsSchema, { cacheKey: `gtm:metrics:${cb}`, cacheTtlSeconds: 86400, maxTokens: 4000 })

  return { icp, positioning, channels, launch_sequence, metrics }
}
