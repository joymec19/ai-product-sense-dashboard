import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface GtmResult {
  positioning_statement: string
  icp_description: string
  value_proposition: string
  pricing_rationale: string
  messaging: Array<{
    variant_label: string
    headline: string
    subheadline: string | null
    tone: 'professional' | 'casual' | 'technical' | 'aspirational'
    target_persona: string | null
  }>
  channels: Array<{
    channel_name: string
    channel_type: 'paid' | 'organic' | 'product' | 'partnerships' | 'events' | 'community'
    cac_usd: number
    cac_source_url: string | null
    cac_confidence: 'low' | 'medium' | 'high'
    target_signups: number
    monthly_budget_usd: number
    priority: number
    rationale: string
  }>
  experiments: Array<{
    hypothesis: string
    metric: string
    baseline_value: number | null
    target_value: number
    channel_name: string | null
    duration_weeks: number
    phase: 'discovery' | 'validation' | 'scaling' | 'deprecated'
    priority: number
  }>
  success_metrics: Array<{
    metric_name: string
    metric_type: 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral'
    definition: string
    target_value: string
    current_value: string | null
    timeframe: string
    owner: string
    data_source: string
  }>
  launch_phases: Array<{
    phase_name: string
    phase_order: number
    start_week: number
    end_week: number
    objectives: string[]
    key_actions: string[]
    success_gate: string
    phase_type: 'pre_launch' | 'soft_launch' | 'growth' | 'scale'
  }>
}

// ── Helpers ───────────────────────────────────────────────────────────────────

interface ChainInput {
  product_name:      string
  target_persona:    string | null
  icp_description:   string | null
  value_proposition: string | null
  geography:         string | null
  pricing_model:     string | null
}

async function tavilySearch(query: string, max = 5): Promise<{ url: string; content: string }[]> {
  const key = process.env.TAVILY_API_KEY
  if (!key) throw new Error('TAVILY_API_KEY not configured')
  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: key, query, search_depth: 'advanced', max_results: max }),
  })
  if (!res.ok) throw new Error(`Tavily ${res.status}`)
  const json = await res.json() as { results?: { url: string; content: string }[] }
  return json.results ?? []
}

/** Strip <think> blocks and extract the first JSON object from a Sarvam response. */
function extractJson(raw: string): string {
  const stripped = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
  const fenced = stripped.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced?.[1]) return fenced[1].trim()
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  if (start !== -1 && end > start) return stripped.slice(start, end + 1)
  throw new Error(`No JSON found in Sarvam response: ${raw.slice(0, 200)}`)
}

async function llmJson<T>(system: string, user: string): Promise<T> {
  const key = process.env.SARVAM_API_KEY
  if (!key) throw new Error('SARVAM_API_KEY not configured')
  const res = await fetch('https://api.sarvam.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-subscription-key': key },
    body: JSON.stringify({
      model: 'sarvam-m',
      temperature: 0.3,
      max_tokens: 2048,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  })
  if (!res.ok) throw new Error(`Sarvam ${res.status}: ${await res.text()}`)
  const json = await res.json() as { choices: { message: { content: string } }[] }
  const raw = json.choices[0]?.message?.content ?? ''
  return JSON.parse(extractJson(raw)) as T
}

// ── Chain steps ───────────────────────────────────────────────────────────────

async function generateCoreStrategy(input: ChainInput): Promise<Pick<GtmResult, 'positioning_statement' | 'icp_description' | 'value_proposition' | 'pricing_rationale' | 'messaging'>> {
  interface R { positioning_statement: string; icp_description: string; value_proposition: string; pricing_rationale: string; messaging: GtmResult['messaging'] }
  return llmJson<R>(
    `You are a senior GTM strategist. Generate core positioning and messaging.
Output ONLY valid JSON:
{
  "positioning_statement": "For [target customer] who [job to be done], [product] is the [category] that [key benefit] unlike [alternative].",
  "icp_description": "2-3 sentence ICP definition covering firmographics, technographics, and behavioral triggers",
  "value_proposition": "single sentence, specific and measurable",
  "pricing_rationale": "2 sentences explaining the chosen pricing model and why it fits the ICP",
  "messaging": [
    {
      "variant_label": "string (e.g. Founder pitch)",
      "headline": "string",
      "subheadline": "string or null",
      "tone": "professional|casual|technical|aspirational",
      "target_persona": "string or null"
    }
  ]
}
Return 3 messaging variants for different contexts (landing page, sales email, conference pitch).`,
    `Product: ${input.product_name}
Target persona: ${input.target_persona ?? 'Not specified'}
ICP hint: ${input.icp_description ?? 'Not specified'}
Value prop hint: ${input.value_proposition ?? 'Not specified'}
Pricing model: ${input.pricing_model ?? 'Not specified'}
Geography: ${input.geography ?? 'Global'}`
  )
}

async function generateChannels(input: ChainInput): Promise<GtmResult['channels']> {
  const results = await tavilySearch(
    `${input.product_name} SaaS customer acquisition cost CAC ${input.pricing_model ?? ''} 2024 2025 benchmarks`
  )
  const ctx = results.map((r) => `${r.url}\n${r.content}`).join('\n\n---\n\n')

  interface R { channels: GtmResult['channels'] }
  const r = await llmJson<R>(
    `You are a growth strategist. Recommend GTM channels with real CAC data from context.
Output ONLY valid JSON:
{
  "channels": [
    {
      "channel_name": "string",
      "channel_type": "paid|organic|product|partnerships|events|community",
      "cac_usd": number (realistic CAC from benchmarks or context),
      "cac_source_url": "URL from context or null",
      "cac_confidence": "low|medium|high",
      "target_signups": integer,
      "monthly_budget_usd": number,
      "priority": 1-5 (1=highest),
      "rationale": "2 sentences explaining why this channel fits this product and ICP"
    }
  ]
}
Return 4-6 channels. CAC must be grounded in context data — use "low" confidence if estimating.`,
    `Product: ${input.product_name}
ICP: ${input.icp_description ?? 'Not specified'}
Pricing model: ${input.pricing_model ?? 'Not specified'}

CAC benchmark context:\n${ctx}`
  )
  return r.channels ?? []
}

async function generateExperimentsAndMetrics(input: ChainInput): Promise<{
  experiments: GtmResult['experiments']
  success_metrics: GtmResult['success_metrics']
}> {
  interface R { experiments: GtmResult['experiments']; success_metrics: GtmResult['success_metrics'] }
  return llmJson<R>(
    `You are a PM building experiment roadmap and success metrics.
Output ONLY valid JSON:
{
  "experiments": [
    {
      "hypothesis": "If we [action] then [metric] will [direction] by [amount] because [reason]",
      "metric": "primary metric being tested",
      "baseline_value": number or null,
      "target_value": number,
      "channel_name": "channel name or null",
      "duration_weeks": integer,
      "phase": "discovery|validation|scaling|deprecated",
      "priority": 1-5
    }
  ],
  "success_metrics": [
    {
      "metric_name": "string",
      "metric_type": "acquisition|activation|retention|revenue|referral",
      "definition": "precise operational definition",
      "target_value": "string with unit (e.g. 500 signups/month)",
      "current_value": "string or null",
      "timeframe": "e.g. Month 3",
      "owner": "role e.g. Growth PM",
      "data_source": "e.g. Mixpanel"
    }
  ]
}
Return 4-6 experiments ordered by phase (discovery first) and 5-8 success metrics covering AARRR.`,
    `Product: ${input.product_name}
Target persona: ${input.target_persona ?? 'Not specified'}
Pricing model: ${input.pricing_model ?? 'Not specified'}`
  )
}

async function generateLaunchPhases(input: ChainInput): Promise<GtmResult['launch_phases']> {
  interface R { launch_phases: GtmResult['launch_phases'] }
  const r = await llmJson<R>(
    `You are a GTM program manager. Build a phased launch timeline.
Output ONLY valid JSON:
{
  "launch_phases": [
    {
      "phase_name": "string (e.g. Private Beta)",
      "phase_order": integer starting at 1,
      "start_week": integer,
      "end_week": integer,
      "objectives": ["array of 2-3 goals for this phase"],
      "key_actions": ["array of 3-5 specific actions"],
      "success_gate": "single measurable criterion to advance to next phase",
      "phase_type": "pre_launch|soft_launch|growth|scale"
    }
  ]
}
Return 4 phases covering pre-launch through scale. start_week/end_week must be sequential and non-overlapping.`,
    `Product: ${input.product_name}
Pricing model: ${input.pricing_model ?? 'Not specified'}
Geography: ${input.geography ?? 'Global'}`
  )
  return r.launch_phases ?? []
}

export async function runGtmChain(input: ChainInput): Promise<GtmResult> {
  const [core, channels, experimentsAndMetrics, launch_phases] = await Promise.all([
    generateCoreStrategy(input),
    generateChannels(input),
    generateExperimentsAndMetrics(input),
    generateLaunchPhases(input),
  ])
  return {
    ...core,
    channels,
    experiments:     experimentsAndMetrics.experiments,
    success_metrics: experimentsAndMetrics.success_metrics,
    launch_phases,
  }
}

// ── API handler ───────────────────────────────────────────────────────────────

interface PostBody extends ChainInput {
  session_id?: string
  plan_id?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PostBody
    if (!body.product_name) {
      return NextResponse.json({ error: 'product_name is required' }, { status: 400 })
    }

    const result = await runGtmChain(body)

    // If session/plan context provided, persist results to Supabase
    if (body.session_id && body.plan_id) {
      const { createClient } = await import('@/lib/supabase/server')
      const sb = await createClient()

      // Update the plan record with core strategy fields
      await sb.from('gtm_plans').update({
        positioning_statement: result.positioning_statement,
        icp_description:       result.icp_description,
        value_proposition:     result.value_proposition,
        pricing_rationale:     result.pricing_rationale,
        updated_at:            new Date().toISOString(),
      }).eq('id', body.plan_id)

      // Upsert channels (delete-then-insert for clean state)
      await sb.from('gtm_channels').delete().eq('gtm_plan_id', body.plan_id)
      if (result.channels.length) {
        await sb.from('gtm_channels').insert(
          result.channels.map((c) => ({ ...c, gtm_plan_id: body.plan_id }))
        )
      }

      // Upsert experiments
      await sb.from('gtm_experiments').delete().eq('gtm_plan_id', body.plan_id)
      if (result.experiments.length) {
        await sb.from('gtm_experiments').insert(
          result.experiments.map((e) => ({ ...e, gtm_plan_id: body.plan_id, status: 'proposed' }))
        )
      }

      // Upsert messaging
      await sb.from('gtm_messaging').delete().eq('session_id', body.session_id)
      if (result.messaging.length) {
        await sb.from('gtm_messaging').insert(
          result.messaging.map((m) => ({ ...m, session_id: body.session_id }))
        )
      }

      // Upsert launch phases
      await sb.from('gtm_launch_phases').delete().eq('session_id', body.session_id)
      if (result.launch_phases.length) {
        await sb.from('gtm_launch_phases').insert(
          result.launch_phases.map((p) => ({ ...p, session_id: body.session_id }))
        )
      }

      // Upsert success metrics
      await sb.from('gtm_success_metrics').delete().eq('session_id', body.session_id)
      if (result.success_metrics.length) {
        await sb.from('gtm_success_metrics').insert(
          result.success_metrics.map((m) => ({ ...m, session_id: body.session_id }))
        )
      }
    }

    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const status = message.includes('SARVAM_API_KEY') ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
