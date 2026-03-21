export type SupportStatus = "full" | "partial" | "none";

export interface CompetitorData {
  id?: string;
  name: string;
  color?: string;
  pricing: {
    model: string;
    starting_price_usd: number | null;
    has_free_tier: boolean;
  };
  scores: {
    ai_sophistication: number;
    pricing_value: number;
    mobile_ux: number;
    integrations: number;
    learning_curve: number;
    [key: string]: number;
  };
  featureSupport: Record<string, SupportStatus>;
  strengths?: string[];
  weaknesses?: string[];
}
