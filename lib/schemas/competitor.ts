import { z } from "zod";

const PricingSchema = z.object({
  model: z.string(),
  starting_price_usd: z.number().nullable(),
  has_free_tier: z.boolean(),
});

const RatingsSchema = z.object({
  g2: z.number().nullable(),
  capterra: z.number().nullable(),
  overall: z.number(),
});

const ScoresSchema = z.object({
  market_presence: z.number().min(1).max(10),
  product_depth: z.number().min(1).max(10),
  ease_of_use: z.number().min(1).max(10),
  value_for_money: z.number().min(1).max(10),
  innovation: z.number().min(1).max(10),
});

const MoatScoresSchema = z.object({
  switching_costs: z.number(),
  network_effects: z.number(),
  data_advantages: z.number(),
  brand: z.number(),
});

export const CompetitorSchema = z.object({
  name: z.string(),
  pricing: PricingSchema,
  features: z.array(z.string()),
  ratings: RatingsSchema,
  positioning: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  gaps: z.array(z.string()),
  scores: ScoresSchema,
  // New fields
  logo_url: z.string().optional(),
  founded: z.number().int().optional(),
  website: z.string().optional(),
  target_segment: z.string().optional(),
  ai_sophistication: z.number().min(1).max(10).optional(),
  ux_score: z.number().min(1).max(10).optional(),
  mobile_score: z.number().min(1).max(10).optional(),
  integration_count: z.number().int().nonnegative().optional(),
  review_summary: z.string().optional(),
  moat_scores: MoatScoresSchema.optional(),
});

export const CompetitorArraySchema = z.array(CompetitorSchema).min(1);

export type Competitor = z.infer<typeof CompetitorSchema>;
