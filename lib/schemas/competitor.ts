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
});

export const CompetitorArraySchema = z.array(CompetitorSchema).min(1);

export type Competitor = z.infer<typeof CompetitorSchema>;
