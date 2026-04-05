// lib/types/index.ts
export type SessionStatus = 'pending' | 'running' | 'complete' | 'failed'

export interface AnalysisSession {
  id: string; user_id: string; product_name: string; product_url?: string
  category?: string; geography?: string; segment_tags: string[]
  custom_competitors: string[]; status: SessionStatus
  error_message?: string; completed_at?: string
  created_at: string; updated_at: string
}

export type SupportLevel = 'none' | 'partial' | 'full' | 'unknown'
export type MoatType = 'network' | 'switching' | 'brand' | 'cost' | 'ip' | 'data' | 'none'
export type Confidence = 'low' | 'medium' | 'high'
export type SignalType = 'regulatory' | 'technology' | 'consumer' | 'competitive' | 'macro'
export type Sentiment = 'positive' | 'negative' | 'neutral'
export type PricingModel = 'freemium' | 'plg' | 'sales_led' | 'hybrid' | 'usage_based'
export type GTMStatus = 'draft' | 'in_review' | 'approved' | 'archived'
export type ChannelType = 'paid' | 'organic' | 'product' | 'partnerships' | 'events' | 'community'
export type ExperimentPhase = 'discovery' | 'validation' | 'scaling' | 'deprecated'
export type ExperimentStatus = 'proposed' | 'running' | 'complete' | 'cancelled'
export type PRDStatus = 'draft' | 'review' | 'approved' | 'archived'
export type PRDSectionType =
  | 'objective' | 'problem_statement' | 'personas' | 'features'
  | 'user_stories' | 'acceptance_criteria' | 'success_metrics'
  | 'risks' | 'technical_notes' | 'gtm_summary'

export interface Competitor {
  id: string; session_id: string; user_id: string; name: string
  website?: string; description?: string; logo_url?: string
  pricing_model?: string; target_segment?: string; founded_year?: number
  employee_count?: number; funding_stage?: string; is_user_added: boolean
  staleness_score: number; fetched_at?: string; source_urls: string[]
  created_at: string; updated_at: string
}
export interface CompetitorFeature {
  id: string; session_id: string; competitor_id: string; feature_name: string
  support_level: SupportLevel; evidence_url?: string; notes?: string
  created_at: string; updated_at: string
}
export interface CompetitorPositioning {
  id: string; session_id: string; competitor_id: string
  axis_x_name: string; axis_y_name: string
  score_x: number; score_y: number; moat_score: number; moat_type: MoatType
  created_at: string; updated_at: string
}
export interface MarketSizing {
  id: string; session_id: string; approach: 'top_down' | 'bottom_up'
  tam_usd?: number; sam_usd?: number; som_usd?: number
  tam_source?: string; sam_source?: string; som_source?: string
  cagr_pct?: number; target_year?: number; confidence?: Confidence
  llm_reasoning?: string; fetched_at: string; created_at: string; updated_at: string
}
export interface MarketTrend {
  id: string; session_id: string; trend_title: string; trend_summary?: string
  source_url?: string; source_name?: string; signal_type?: SignalType
  sentiment?: Sentiment; relevance_score?: number; published_at?: string
  fetched_at: string; created_at: string; updated_at: string
}
export interface FundingEvent {
  id: string; session_id: string; competitor_id?: string; company_name: string
  round_type?: string; amount_usd?: number; investors: string[]
  announced_at?: string; source_url?: string
  fetched_at: string; created_at: string; updated_at: string
}
export interface GTMPlan {
  id: string; session_id: string; positioning_statement?: string
  target_persona?: string; icp_description?: string; value_proposition?: string
  pricing_model?: PricingModel; pricing_rationale?: string
  launch_date_target?: string; status: GTMStatus
  created_at: string; updated_at: string
}
export interface GTMChannel {
  id: string; gtm_plan_id: string; channel_name: string; channel_type?: ChannelType
  cac_usd?: number; cac_source_url?: string; cac_confidence?: Confidence
  target_signups?: number; monthly_budget_usd?: number; priority?: number
  rationale?: string; created_at: string; updated_at: string
}
export interface GTMExperiment {
  id: string; gtm_plan_id: string; hypothesis: string; metric: string
  baseline_value?: number; target_value?: number; channel_id?: string
  duration_weeks?: number; phase?: ExperimentPhase; priority?: number
  status: ExperimentStatus; result_summary?: string
  started_at?: string; ended_at?: string; created_at: string; updated_at: string
}
export interface PRDDocument {
  id: string; session_id: string; title: string; version_number: number
  parent_id?: string; is_latest: boolean; status: PRDStatus
  created_at: string; updated_at: string
}
export interface PRDSection {
  id: string; prd_id: string; section_type: PRDSectionType; sort_order: number
  content_md?: string; ai_content_md?: string; is_user_edited: boolean
  last_ai_run_at?: string; created_at: string; updated_at: string
}
