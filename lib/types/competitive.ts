// lib/types/competitive.ts — extended types for competitive intelligence feature
import type { SupportLevel, MoatType } from './index'

export type GapType = 'feature' | 'segment' | 'geographic' | 'pricing' | 'channel' | 'integration'
export type GapUrgency = 'immediate' | '6_months' | '12_months' | 'long_term'
export type MarketSizeSignal = 'large' | 'medium' | 'small' | 'unknown'
export type FeatureCategory = 'core' | 'differentiating' | 'table_stakes' | 'emerging'
export type BuyerImportance = 'critical' | 'important' | 'nice_to_have'

export interface StrategicGap {
  id: string
  session_id: string
  user_id: string
  gap_title: string
  gap_type: GapType
  description?: string
  addressable_by?: string
  urgency: GapUrgency
  market_size_signal?: MarketSizeSignal
  evidence: string[]
  white_space_summary?: string
  recommended_focus?: string
  created_at: string
  updated_at: string
}

export interface CompetitorMatrixRow {
  feature_name: string
  category: FeatureCategory
  importance_to_buyer: BuyerImportance
  scores: Record<string, { support_level: SupportLevel; evidence?: string }>
}

export interface PositioningPoint {
  competitor_id: string
  competitor_name: string
  score_x: number
  score_y: number
  moat_score: number
  moat_type: MoatType
  axis_x_name: string
  axis_y_name: string
}
