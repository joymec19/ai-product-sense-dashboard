-- Migration: Expand Supabase schema for redesign
-- Date: 2026-03-28

-- ============================================================
-- Add missing columns to analyses
-- ============================================================
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'configure';
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS market_scope JSONB;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS home_product_context TEXT;
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS custom_competitors TEXT[];

-- ============================================================
-- Add missing columns to competitors
-- ============================================================
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS founded INT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS target_segment TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS ai_sophistication INT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS ux_score INT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS mobile_score INT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS integration_count INT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS review_summary TEXT;
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS moat_scores JSONB;

-- ============================================================
-- Create prd_documents table
-- ============================================================
CREATE TABLE IF NOT EXISTS prd_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  objective TEXT,
  problem_statement TEXT,
  solution_narrative TEXT,
  personas JSONB,
  features JSONB,
  success_metrics JSONB,
  risks JSONB,
  gtm JSONB,
  version INT DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Create market_data table
-- ============================================================
CREATE TABLE IF NOT EXISTS market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  tam NUMERIC,
  sam NUMERIC,
  som NUMERIC,
  growth_rate NUMERIC,
  assumptions JSONB,
  trend_keywords TEXT[],
  adjacent_markets TEXT[]
);

-- ============================================================
-- Create annotations table
-- ============================================================
CREATE TABLE IF NOT EXISTS annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Enable Row Level Security
-- ============================================================
ALTER TABLE prd_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies: public SELECT when analysis has a share_token
-- ============================================================
CREATE POLICY "Public read prd_documents via share_token"
  ON prd_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analyses
      WHERE analyses.id = prd_documents.analysis_id
        AND analyses.share_token IS NOT NULL
    )
  );

CREATE POLICY "Public read market_data via share_token"
  ON market_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analyses
      WHERE analyses.id = market_data.analysis_id
        AND analyses.share_token IS NOT NULL
    )
  );
