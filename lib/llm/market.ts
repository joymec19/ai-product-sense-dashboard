import { z } from 'zod'
import { getLLMService } from '../LLMService'
import { createHash } from 'crypto'

export const MarketSizingSchema = z.object({
  top_down: z.object({
    tam_usd: z.number().positive(), sam_usd: z.number().positive(), som_usd: z.number().positive(),
    tam_source: z.string(), sam_source: z.string(), som_source: z.string(),
    tam_rationale: z.string().max(300), sam_rationale: z.string().max(300), som_rationale: z.string().max(300),
  }),
  bottom_up: z.object({
    tam_usd: z.number().positive(), sam_usd: z.number().positive(), som_usd: z.number().positive(),
    addressable_accounts: z.number().int().positive(),
    avg_contract_value_usd: z.number().positive(),
    methodology: z.string().max(400),
  }),
  reconciliation: z.object({
    preferred_approach: z.enum(['top_down','bottom_up','average']),
    reconciled_tam: z.number().positive(), reconciled_sam: z.number().positive(), reconciled_som: z.number().positive(),
    confidence: z.enum(['low','medium','high']),
    confidence_rationale: z.string().max(300),
  }),
  cagr_pct: z.number().min(-20).max(100),
  target_year: z.number().int().min(2024).max(2035),
  key_growth_drivers: z.array(z.string()).min(2).max(5),
})
export type MarketSizingOutput = z.infer<typeof MarketSizingSchema>

export const TrendExtractionSchema = z.object({
  trends: z.array(z.object({
    trend_title: z.string().max(100), trend_summary: z.string().max(400),
    signal_type: z.enum(['regulatory','technology','consumer','competitive','macro']),
    sentiment: z.enum(['positive','negative','neutral']),
    relevance_score: z.number().min(0).max(1),
    time_horizon: z.enum(['now','6_months','1_year','2_years','5_years']),
    impact_on_product: z.string().max(300),
    supporting_signals: z.array(z.string()).max(3),
  })).min(5).max(15),
  macro_narrative: z.string().max(600),
  most_disruptive_trend: z.string(),
})
export type TrendExtraction = z.infer<typeof TrendExtractionSchema>

export const BuyerPersonaSchema = z.object({
  personas: z.array(z.object({
    persona_name: z.string(), title: z.string(), company_size: z.string(),
    industry_verticals: z.array(z.string()).max(4),
    primary_job_to_be_done: z.string().max(200),
    top_pains: z.array(z.string()).min(3).max(6),
    desired_outcomes: z.array(z.string()).min(2).max(5),
    buying_triggers: z.array(z.string()).min(2).max(4),
    objections: z.array(z.string()).min(2).max(4),
    willingness_to_pay: z.enum(['low','medium','high','enterprise']),
    decision_making_role: z.enum(['champion','decision_maker','influencer','end_user','blocker']),
    preferred_channels: z.array(z.string()).max(4),
    key_quote: z.string().max(150),
  })).min(2).max(5),
  icp_summary: z.string().max(400),
  anti_persona: z.object({ description: z.string().max(200), reason_excluded: z.string().max(200) }),
})
export type BuyerPersonaOutput = z.infer<typeof BuyerPersonaSchema>

export const RiskFactorsSchema = z.object({
  risks: z.array(z.object({
    risk_title: z.string().max(100),
    risk_type: z.enum(['market','competitive','regulatory','technology','execution','financial']),
    description: z.string().max(400),
    probability: z.enum(['low','medium','high']),
    impact: z.enum(['low','medium','high','critical']),
    mitigation: z.string().max(300),
    early_warning_signals: z.array(z.string()).max(3),
  })).min(4).max(10),
  risk_matrix_summary: z.string().max(400),
  highest_priority_risk: z.string(),
})
export type RiskFactors = z.infer<typeof RiskFactorsSchema>

export interface MarketIntelligenceOutput {
  sizing: MarketSizingOutput; trends: TrendExtraction
  personas: BuyerPersonaOutput; risks: RiskFactors
}

const MARKET_SYSTEM = `You are a senior market analyst and product strategist with deep expertise in B2B SaaS market research. You specialise in TAM/SAM/SOM modelling, trend analysis, and buyer psychology.

Rules:
- Use publicly known market data from analyst reports (Gartner, IDC, Forrester, G2). Cite source names.
- For bottom-up sizing: use realistic ASP and addressable account counts for the segment.
- Personas must reflect real buyer psychology — not marketing archetypes. Include genuine objections.
- Risks must be actionable, not generic platitudes.
- Respond ONLY with a valid JSON object matching the requested schema.`

export function buildMarketSizingPrompt(input: { product_name: string; category?: string; geography?: string }): string {
  return `Estimate the market size for: ${input.product_name}
${input.category ? `Category: ${input.category}` : ''}
${input.geography ? `Primary market: ${input.geography}` : 'Global'}

Provide BOTH top-down (cite analyst reports) and bottom-up (addressable accounts × ACV) estimates for TAM/SAM/SOM.
Reconcile and pick the preferred approach with a confidence rating.
Include CAGR and top growth drivers.
Return JSON matching the MarketSizing schema exactly.`
}

export function buildTrendPrompt(input: { product_name: string; category?: string; sizing: MarketSizingOutput }): string {
  return `Identify market trends affecting: ${input.product_name}
${input.category ? `Category: ${input.category}` : ''}
Market growth drivers: ${input.sizing.key_growth_drivers.join(', ')}

Identify 6–12 relevant trends across regulatory, technology, consumer behaviour, competitive dynamics, and macro.
Score relevance 0–1, assign time horizon, explain specific product impact.
Return JSON matching the TrendExtraction schema exactly.`
}

export function buildPersonaPrompt(input: { product_name: string; sizing: MarketSizingOutput; trends: TrendExtraction }): string {
  return `Define buyer personas for: ${input.product_name}
SAM: $${input.sizing.reconciliation.reconciled_sam.toLocaleString()}
Top disruptive trend: ${input.trends.most_disruptive_trend}

Create 2–4 distinct buyer personas. Include: JTBD, top pains, desired outcomes, buying triggers, objections, WTP, decision role, and a key quote.
Also define an anti-persona.
Return JSON matching the BuyerPersona schema exactly.`
}

export function buildRiskPrompt(input: { product_name: string; sizing: MarketSizingOutput; trends: TrendExtraction; personas: BuyerPersonaOutput }): string {
  const negTrends = input.trends.trends.filter(t => t.sentiment === 'negative').map(t => t.trend_title).join(', ')
  return `Assess market entry risks for: ${input.product_name}
Market confidence: ${input.sizing.reconciliation.confidence}
Negative trends: ${negTrends || 'none identified'}
Primary buyer objections: ${input.personas.personas.flatMap(p => p.objections).slice(0, 4).join('; ')}

Identify 5–8 risks across market, competitive, regulatory, technology, execution, financial.
Return JSON matching the RiskFactors schema exactly.`
}

export async function runMarketChain(input: { product_name: string; category?: string; geography?: string; sessionId: string }): Promise<MarketIntelligenceOutput> {
  const llm = getLLMService()
  const cb = createHash('sha256').update(`${input.product_name}:${input.category ?? ''}:${input.geography ?? ''}`).digest('hex').slice(0, 16)

  const sizing = await llm.call(MARKET_SYSTEM, buildMarketSizingPrompt(input), MarketSizingSchema, { cacheKey: `market:sizing:${cb}`, cacheTtlSeconds: 604800 })
  const trends = await llm.call(MARKET_SYSTEM, buildTrendPrompt({ ...input, sizing }), TrendExtractionSchema, { cacheKey: `market:trends:${cb}`, cacheTtlSeconds: 86400 })
  const personas = await llm.call(MARKET_SYSTEM, buildPersonaPrompt({ ...input, sizing, trends }), BuyerPersonaSchema, { cacheKey: `market:personas:${cb}`, cacheTtlSeconds: 604800 })
  const risks = await llm.call(MARKET_SYSTEM, buildRiskPrompt({ product_name: input.product_name, sizing, trends, personas }), RiskFactorsSchema, { cacheKey: `market:risks:${cb}`, cacheTtlSeconds: 86400 })

  return { sizing, trends, personas, risks }
}
