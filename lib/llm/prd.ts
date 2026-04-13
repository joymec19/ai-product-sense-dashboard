import { z } from 'zod'
import { getLLMService } from '../LLMService'
import { createHash } from 'crypto'
import type { PRDSectionType } from '../types'

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionContext = {
  id: string
  product_name: string
  category?: string | null
  segment_tags?: string[] | null
  geography?: string | null
}

type CompetitorRow = {
  name: string
  positioning?: string | null
  pricing?: unknown
  features?: unknown
  moat_type?: string | null
}

export type PRDSectionOutput = { type: PRDSectionType; content: string }
export type PRDOutput = { sections: PRDSectionOutput[] }

// ─── Schemas (compact — designed to fit within the 2048-token output cap) ────

const NarrativeSchema = z.object({
  objective: z.string().max(600),
  problem_statement: z.string().max(600),
  technical_notes: z.string().max(600),
  gtm_summary: z.string().max(600),
})

const PersonasRisksMetricsSchema = z.object({
  personas_md: z.string().max(800),
  success_metrics_md: z.string().max(600),
  risks_md: z.string().max(600),
})

const FeaturesSchema = z.object({
  features_md: z.string().max(700),
  user_stories_md: z.string().max(600),
  acceptance_criteria_md: z.string().max(600),
})

// ─── System prompt ────────────────────────────────────────────────────────────

const PRD_SYSTEM = `You are a senior product manager with 10+ years of experience writing PRDs at top-tier B2B SaaS companies.
Write clear, structured, actionable product requirements using markdown formatting (headers, bullets, tables where appropriate).
Ground every claim in the provided product and competitive context — do not invent unrelated facts.
Respond ONLY with a valid JSON object matching the exact schema requested. No prose outside JSON.`

// ─── Context builder ──────────────────────────────────────────────────────────

function buildContext(session: SessionContext, competitors: CompetitorRow[]): string {
  const segments = session.segment_tags?.join(', ') ?? 'N/A'
  const geo = session.geography ?? 'Global'
  const compNames = competitors.map(c => c.name).join(', ') || 'None identified'
  const compSummary = competitors
    .slice(0, 4)
    .map(c => `- ${c.name}: positioning="${c.positioning ?? 'unknown'}", moat="${c.moat_type ?? 'unknown'}"`)
    .join('\n')

  return `Product: ${session.product_name}
Category: ${session.category ?? 'N/A'}
Geography: ${geo}
Target segments: ${segments}
Known competitors: ${compNames}
${compSummary ? `Competitor details:\n${compSummary}` : ''}`
}

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildNarrativePrompt(ctx: string): string {
  return `${ctx}

Generate the narrative sections of a PRD for this product. Return JSON with these keys:
- "objective": 2-4 sentence product objective (what we are building and why)
- "problem_statement": 2-4 sentences describing the core user problem and its business impact
- "technical_notes": 2-4 sentences covering the proposed solution approach and key architectural considerations
- "gtm_summary": 2-4 sentences covering target segment, positioning, primary channel, and pricing strategy

All values must be plain markdown strings (no nested JSON).`
}

function buildPersonasRisksMetricsPrompt(ctx: string): string {
  return `${ctx}

Generate personas, success metrics, and risks for a PRD. Return JSON with:
- "personas_md": markdown table or list of 2–3 target user personas (name, role, top pain points, desired outcomes)
- "success_metrics_md": markdown list of 4–6 measurable success metrics (metric name, baseline, target, timeframe)
- "risks_md": markdown list of 3–5 key risks with likelihood (L/M/H), impact (L/M/H), and mitigation

All values must be valid markdown strings.`
}

function buildFeaturesPrompt(ctx: string): string {
  return `${ctx}

Generate feature requirements for a PRD. Return JSON with:
- "features_md": markdown list of P1 features (3–5 items) labelled **P1**, then P2 (2–4 items) labelled **P2**. Each item: feature title + one-line description.
- "user_stories_md": markdown list of user stories for the P1 features in "As a [role], I want [action] so that [benefit]" format.
- "acceptance_criteria_md": markdown checklist of acceptance criteria for the top 3 P1 features, grouped by feature name.

All values must be valid markdown strings.`
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generatePRD(input: {
  session: SessionContext
  competitors: CompetitorRow[]
}): Promise<PRDOutput> {
  const llm = getLLMService()
  const cb = createHash('sha256')
    .update(`${input.session.id}:${input.session.product_name}`)
    .digest('hex')
    .slice(0, 16)

  const ctx = buildContext(input.session, input.competitors)

  // Three parallel LLM calls — each comfortably under the 2048-token output cap
  const [narrative, personasEtc, features] = await Promise.all([
    llm.call(PRD_SYSTEM, buildNarrativePrompt(ctx), NarrativeSchema, {
      cacheKey: `prd:narrative:${cb}`,
      cacheTtlSeconds: 86400,
    }),
    llm.call(PRD_SYSTEM, buildPersonasRisksMetricsPrompt(ctx), PersonasRisksMetricsSchema, {
      cacheKey: `prd:personas:${cb}`,
      cacheTtlSeconds: 86400,
    }),
    llm.call(PRD_SYSTEM, buildFeaturesPrompt(ctx), FeaturesSchema, {
      cacheKey: `prd:features:${cb}`,
      cacheTtlSeconds: 86400,
    }),
  ])

  const sections: PRDSectionOutput[] = [
    { type: 'objective', content: narrative.objective },
    { type: 'problem_statement', content: narrative.problem_statement },
    { type: 'personas', content: personasEtc.personas_md },
    { type: 'features', content: features.features_md },
    { type: 'user_stories', content: features.user_stories_md },
    { type: 'acceptance_criteria', content: features.acceptance_criteria_md },
    { type: 'success_metrics', content: personasEtc.success_metrics_md },
    { type: 'risks', content: personasEtc.risks_md },
    { type: 'technical_notes', content: narrative.technical_notes },
    { type: 'gtm_summary', content: narrative.gtm_summary },
  ]

  return { sections }
}
