-- Migration: strategic_gaps table for competitive intelligence
-- Date: 2026-04-05

CREATE TABLE IF NOT EXISTS strategic_gaps (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES auth.users(id),
  gap_title           TEXT NOT NULL,
  gap_type            TEXT NOT NULL CHECK (gap_type IN ('feature','segment','geographic','pricing','channel','integration')),
  description         TEXT,
  addressable_by      TEXT,
  urgency             TEXT NOT NULL CHECK (urgency IN ('immediate','6_months','12_months','long_term')),
  market_size_signal  TEXT CHECK (market_size_signal IN ('large','medium','small','unknown')),
  evidence            TEXT[] NOT NULL DEFAULT '{}',
  white_space_summary TEXT,
  recommended_focus   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS strategic_gaps_session_id_idx ON strategic_gaps(session_id);

ALTER TABLE strategic_gaps ENABLE ROW LEVEL SECURITY;

-- Owner can read/write their own gaps
CREATE POLICY "Users can read own strategic gaps"
  ON strategic_gaps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategic gaps"
  ON strategic_gaps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategic gaps"
  ON strategic_gaps FOR UPDATE
  USING (auth.uid() = user_id);

-- Public read via share_token
CREATE POLICY "Public read strategic_gaps via share_token"
  ON strategic_gaps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = strategic_gaps.session_id
        AND analysis_sessions.share_token IS NOT NULL
    )
  );
