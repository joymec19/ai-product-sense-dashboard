import { z } from "zod";

const PricingSchema = z.object({
  model: z.string().default('unknown'),
  starting_price_usd: z.number().nullable().default(null),
  has_free_tier: z.boolean().default(false),
});

const RatingsSchema = z.object({
  g2: z.number().nullable().default(null),
  capterra: z.number().nullable().default(null),
  overall: z.number().default(5),
});

const ScoresSchema = z.object({
  market_presence: z.number().min(1).max(10).default(5),
  product_depth: z.number().min(1).max(10).default(5),
  ease_of_use: z.number().min(1).max(10).default(5),
  value_for_money: z.number().min(1).max(10).default(5),
  innovation: z.number().min(1).max(10).default(5),
});

const MoatScoresSchema = z.object({
  switching_costs: z.number().default(5),
  network_effects: z.number().default(5),
  data_advantages: z.number().default(5),
  brand: z.number().default(5),
});

export const CompetitorSchema = z.object({
  name: z.string(),
  pricing: PricingSchema.default({ model: 'unknown', starting_price_usd: null, has_free_tier: false }),
  features: z.array(z.string()).default([]),
  ratings: RatingsSchema.default({ g2: null, capterra: null, overall: 5 }),
  positioning: z.string().default(''),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  scores: ScoresSchema.default({ market_presence: 5, product_depth: 5, ease_of_use: 5, value_for_money: 5, innovation: 5 }),
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
