import { z } from 'zod'
import { getLLMService } from '../LLMService'
import { createHash } from 'crypto'

export const CompanyExtractionSchema = z.object({
  competitors: z.array(z.object({
    name: z.string(),
    website: z.string().url().optional(),
    description: z.string().max(300),
    pricing_model: z.enum(['freemium','paid','enterprise','usage_based','open_source','unknown']),
    target_segment: z.string(),
    founded_year: z.number().int().min(1900).max(2030).optional(),
    employee_range: z.enum(['1-10','11-50','51-200','201-1000','1000+','unknown']).optional(),
    funding_stage: z.enum(['bootstrapped','seed','series_a','series_b','series_c_plus','public','unknown']).optional(),
    key_differentiator: z.string().max(200),
    source_confidence: z.enum(['high','medium','low']),
  })).min(2).max(12),
  market_context: z.string().max(500),
  direct_competitors: z.array(z.string()),
  indirect_competitors: z.array(z.string()),
})
export type CompanyExtraction = z.infer<typeof CompanyExtractionSchema>

export const PositioningMapSchema = z.object({
  axes_suggestion: z.array(z.object({
    axis_x_name: z.string(), axis_y_name: z.string(), rationale: z.string(),
  })).min(1).max(3),
  primary_positioning: z.array(z.object({
    competitor_name: z.string(),
    axis_x_name: z.string(), axis_y_name: z.string(),
    score_x: z.number().min(0).max(10), score_y: z.number().min(0).max(10),
    score_rationale: z.string(),
    moat_score: z.number().min(0).max(10),
    moat_type: z.enum(['network','switching','brand','cost','ip','data','none']),
    moat_rationale: z.string().max(300),
  })),
  empty_quadrant_opportunity: z.string().max(500),
})
export type PositioningMap = z.infer<typeof PositioningMapSchema>

export const FeatureMatrixSchema = z.object({
  features: z.array(z.object({
    feature_name: z.string(),
    category: z.enum(['core','differentiating','table_stakes','emerging']),
    importance_to_buyer: z.enum(['critical','important','nice_to_have']),
    scores: z.record(z.string(), z.object({
      support_level: z.enum(['none','partial','full','unknown']),
      evidence: z.string().optional(),
    })),
  })).min(5).max(25),
  feature_coverage_summary: z.record(z.string(), z.object({
    coverage_pct: z.number().min(0).max(100),
    strongest_area: z.string(),
    weakest_area: z.string(),
  })),
})
export type FeatureMatrix = z.infer<typeof FeatureMatrixSchema>

export const StrategicGapsSchema = z.object({
  gaps: z.array(z.object({
    gap_title: z.string(),
    gap_type: z.enum(['feature','segment','geographic','pricing','channel','integration']),
    description: z.string().max(400),
    addressable_by: z.string(),
    urgency: z.enum(['immediate','6_months','12_months','long_term']),
    market_size_signal: z.enum(['large','medium','small','unknown']),
    evidence: z.array(z.string()).max(3),
  })).min(3).max(10),
  white_space_summary: z.string().max(600),
  recommended_focus: z.string().max(400),
})
export type StrategicGaps = z.infer<typeof StrategicGapsSchema>

export interface CompetitiveIntelligenceOutput {
  extraction: CompanyExtraction
  positioning: PositioningMap
  feature_matrix: FeatureMatrix
  strategic_gaps: StrategicGaps
}

const COMPETITIVE_SYSTEM = `You are a senior product strategist and competitive intelligence analyst with 15 years of experience in B2B SaaS. Your job is to produce structured, evidence-based competitive analysis for product managers.

Rules:
- Base every claim on publicly available information. If unknown, use source_confidence: "low".
- Never hallucinate product features. If uncertain, mark support_level as "unknown".
- Be specific: name features, cite pricing tiers, reference company-stated positioning.
- Format: respond ONLY with a valid JSON object matching the exact schema requested.
- Scores on 0-10 must reflect real differentiation, not artificial spread.`

export function buildExtractionPrompt(input: {
  product_name: string; product_url?: string; category?: string
  geography?: string; custom_competitors?: string[]
}): string {
  return `Analyse the competitive landscape for this product:

Product: ${input.product_name}
${input.product_url ? `URL: ${input.product_url}` : ''}
${input.category ? `Category: ${input.category}` : ''}
${input.geography ? `Primary market: ${input.geography}` : ''}
${input.custom_competitors?.length ? `Include these competitors: ${input.custom_competitors.join(', ')}` : ''}

Identify 5–10 real competitors (direct and indirect). For each extract: name, website, one-line description, pricing model, target segment, founding year, employee range, funding stage, and the single most important differentiator.
Classify competitors as direct vs indirect.

Return JSON matching the CompanyExtraction schema exactly.`
}

export function buildPositioningPrompt(input: { product_name: string; extraction: CompanyExtraction }): string {
  return `Based on this competitive landscape for ${input.product_name}:
Competitors: ${input.extraction.competitors.map(c => c.name).join(', ')}
Market context: ${input.extraction.market_context}

1. Suggest 1–3 axis pairs (X vs Y) that best reveal strategic differentiation. Common axes: Price vs Enterprise Readiness, Ease of Use vs Feature Depth, PLG vs Sales-Led, SMB vs Enterprise.
2. Score each competitor 0–10 on both primary axes with rationale.
3. Assign moat score and type to each competitor.
4. Identify any empty quadrant representing a market opportunity.

Return JSON matching the PositioningMap schema exactly.`
}

export function buildFeatureMatrixPrompt(input: {
  product_name: string; extraction: CompanyExtraction; positioning: PositioningMap
}): string {
  return `Build a feature matrix for ${input.product_name} vs. competitors: ${input.extraction.competitors.map(c => c.name).join(', ')}

- Identify 8–20 meaningful features for this product category
- Categorise: core / differentiating / table_stakes / emerging
- For each competitor mark: none / partial / full / unknown with evidence
- Calculate coverage summary per competitor

Return JSON matching the FeatureMatrix schema exactly.`
}

export function buildStrategicGapsPrompt(input: {
  product_name: string; extraction: CompanyExtraction
  positioning: PositioningMap; feature_matrix: FeatureMatrix
}): string {
  const weakCoverage = Object.entries(input.feature_matrix.feature_coverage_summary)
    .sort((a, b) => a[1].coverage_pct - b[1].coverage_pct).slice(0, 3)
    .map(([n, s]) => `${n}: weakest in ${s.weakest_area}`).join('; ')
  return `Identify strategic gaps in the ${input.product_name} market.
Empty quadrant opportunity: ${input.positioning.empty_quadrant_opportunity}
Lowest-coverage competitors: ${weakCoverage}

Identify 3–8 gaps across: feature, segment, geographic, pricing, channel, and integration.
Write a white-space summary and a recommended focus for a new entrant.

Return JSON matching the StrategicGaps schema exactly.`
}

export async function runCompetitiveChain(input: {
  product_name: string; product_url?: string; category?: string
  geography?: string; custom_competitors?: string[]; sessionId: string
}): Promise<CompetitiveIntelligenceOutput> {
  const llm = getLLMService()
  const cb = createHash('sha256').update(`${input.product_name}:${input.product_url ?? ''}:${input.category ?? ''}`).digest('hex').slice(0, 16)

  const extraction = await llm.call(COMPETITIVE_SYSTEM, buildExtractionPrompt(input), CompanyExtractionSchema,
    { cacheKey: `competitive:extraction:${cb}`, cacheTtlSeconds: 86400 })
  const positioning = await llm.call(COMPETITIVE_SYSTEM, buildPositioningPrompt({ product_name: input.product_name, extraction }), PositioningMapSchema,
    { cacheKey: `competitive:positioning:${cb}`, cacheTtlSeconds: 86400 })
  const feature_matrix = await llm.call(COMPETITIVE_SYSTEM, buildFeatureMatrixPrompt({ product_name: input.product_name, extraction, positioning }), FeatureMatrixSchema,
    { cacheKey: `competitive:features:${cb}`, cacheTtlSeconds: 86400, maxTokens: 6000 })
  const strategic_gaps = await llm.call(COMPETITIVE_SYSTEM, buildStrategicGapsPrompt({ product_name: input.product_name, extraction, positioning, feature_matrix }), StrategicGapsSchema,
    { cacheKey: `competitive:gaps:${cb}`, cacheTtlSeconds: 86400 })

  return { extraction, positioning, feature_matrix, strategic_gaps }
}
