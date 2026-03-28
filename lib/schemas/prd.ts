import { z } from "zod";

const PersonaSchema = z.object({
  name: z.string(),
  role: z.string(),
  goals: z.array(z.string()),
  pain_points: z.array(z.string()),
  tech_savviness: z.enum(["low", "medium", "high"]),
});

const FeatureItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  user_story: z.string(),
  acceptance_criteria: z.array(z.string()),
});

const RoadmapItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
});

const FeaturesSchema = z.object({
  p1: z.array(FeatureItemSchema),
  p2: z.array(FeatureItemSchema),
  p3: z.array(RoadmapItemSchema),
});

const SuccessMetricSchema = z.object({
  metric: z.string(),
  target: z.string(),
  measurement_method: z.string(),
  timeframe: z.string(),
});

const RiskSchema = z.object({
  risk: z.string(),
  likelihood: z.enum(["low", "medium", "high"]),
  impact: z.enum(["low", "medium", "high"]),
  mitigation: z.string(),
});

const LaunchPhaseSchema = z.object({
  phase: z.number().int(),
  name: z.string(),
  duration: z.string(),
  goals: z.array(z.string()),
});

const GTMSchema = z.object({
  target_segment: z.string(),
  positioning_statement: z.string(),
  channels: z.array(z.string()),
  pricing_strategy: z.string(),
  launch_phases: z.array(LaunchPhaseSchema),
});

/** Validated shape returned from the LLM — use PRDDocument from lib/types/dashboard for the full DB-backed type */
export const PRDSchema = z.object({
  objective: z.string(),
  problem_statement: z.string(),
  solution_narrative: z.string(),
  personas: z.array(PersonaSchema),
  features: FeaturesSchema,
  success_metrics: z.array(SuccessMetricSchema),
  risks: z.array(RiskSchema),
  gtm: GTMSchema,
});

export type PRDContent = z.infer<typeof PRDSchema>;
