export type SupportStatus = "full" | "partial" | "none";

export interface AnalysisConfig {
  category: string;
  disambiguated: string;
  productContext: {
    type: "file" | "questionnaire" | "skip";
    content: string;
  };
  geography: string[];
  segment: string[];
  customCompetitors: string[];
}

export interface CompetitorData {
  id?: string;
  analysis_id?: string;
  name: string;
  color?: string;
  logo_url?: string;
  founded?: number;
  website?: string;
  target_segment?: string;
  pricing: {
    model: string;
    starting_price_usd: number | null;
    has_free_tier: boolean;
  };
  features?: string[];
  ratings?: {
    g2: number | null;
    capterra: number | null;
    overall: number;
  };
  positioning?: string;
  strengths?: string[];
  weaknesses?: string[];
  gaps?: string[];
  scores?: {
    market_presence?: number;
    product_depth?: number;
    ease_of_use?: number;
    value_for_money?: number;
    innovation?: number;
  };
  ai_sophistication?: number;
  ux_score?: number;
  mobile_score?: number;
  integration_count?: number;
  review_summary?: string;
  moat_scores?: {
    switching_costs: number;
    network_effects: number;
    data_advantages: number;
    brand: number;
  };
  featureSupport?: Record<string, SupportStatus>;
}

export interface Persona {
  name: string;
  role: string;
  pain_points: string[];
  wtp: string;
}

export interface Feature {
  title: string;
  description: string;
  jtbd: string;
  ice: {
    impact: number;
    confidence: number;
    ease: number;
  };
}

export interface Metric {
  name: string;
  baseline: string;
  target: string;
}

export interface Risk {
  description: string;
  likelihood: number;
  impact: number;
  mitigation: string;
}

export interface Channel {
  name: string;
  cac: string;
  signups: string;
}

export interface Experiment {
  hypothesis: string;
  variant_a: string;
  success_criteria: string;
}

export interface GTMData {
  positioning: string;
  channels: Channel[];
  pricing: string;
  experiments: Experiment[];
}

export interface PRDDocument {
  id: string;
  analysis_id: string;
  version: number;
  objective: string;
  problem_statement: string;
  solution_narrative: string;
  personas: Persona[];
  features: {
    p1: Feature[];
    p2: Feature[];
    p3: Feature[];
  };
  success_metrics: Metric[];
  risks: Risk[];
  gtm: GTMData;
}

export interface MarketData {
  tam: number;
  sam: number;
  som: number;
  growth_rate: number;
  adjacent_markets: string[];
  assumptions: Record<string, string>;
}

export interface Annotation {
  id: string;
  section: string;
  content: string;
}
