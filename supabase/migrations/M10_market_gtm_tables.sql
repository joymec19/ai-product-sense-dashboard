-- Migration: M10 — Market Intelligence + GTM tables
-- Date: 2026-04-06

-- ============================================================
-- GTM tables
-- ============================================================

CREATE TABLE IF NOT EXISTS gtm_plans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  positioning_statement TEXT,
  target_persona        TEXT,
  icp_description       TEXT,
  value_proposition     TEXT,
  pricing_model         TEXT CHECK (pricing_model IN ('freemium','plg','sales_led','hybrid','usage_based')),
  pricing_rationale     TEXT,
  launch_date_target    DATE,
  status                TEXT NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','in_review','approved','archived')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gtm_channels (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gtm_plan_id        UUID NOT NULL REFERENCES gtm_plans(id) ON DELETE CASCADE,
  channel_name       TEXT NOT NULL,
  channel_type       TEXT CHECK (channel_type IN ('paid','organic','product','partnerships','events','community')),
  cac_usd            NUMERIC,
  cac_source_url     TEXT,
  cac_confidence     TEXT CHECK (cac_confidence IN ('low','medium','high')),
  target_signups     INTEGER,
  monthly_budget_usd NUMERIC,
  priority           INTEGER,
  rationale          TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gtm_experiments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gtm_plan_id     UUID NOT NULL REFERENCES gtm_plans(id) ON DELETE CASCADE,
  hypothesis      TEXT NOT NULL,
  metric          TEXT NOT NULL,
  baseline_value  NUMERIC,
  target_value    NUMERIC,
  channel_id      UUID REFERENCES gtm_channels(id) ON DELETE SET NULL,
  duration_weeks  INTEGER,
  phase           TEXT CHECK (phase IN ('discovery','validation','scaling','deprecated')),
  priority        INTEGER,
  status          TEXT NOT NULL DEFAULT 'proposed'
                    CHECK (status IN ('proposed','running','complete','cancelled')),
  result_summary  TEXT,
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gtm_messaging (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  variant_label   TEXT NOT NULL,
  headline        TEXT NOT NULL,
  subheadline     TEXT,
  tone            TEXT CHECK (tone IN ('professional','casual','technical','aspirational')),
  target_persona  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gtm_launch_phases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  phase_name    TEXT NOT NULL,
  phase_order   INTEGER NOT NULL,
  start_week    INTEGER NOT NULL,
  end_week      INTEGER NOT NULL,
  objectives    TEXT[] NOT NULL DEFAULT '{}',
  key_actions   TEXT[] NOT NULL DEFAULT '{}',
  success_gate  TEXT NOT NULL,
  phase_type    TEXT NOT NULL
                  CHECK (phase_type IN ('pre_launch','soft_launch','growth','scale')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS gtm_success_metrics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  metric_name  TEXT NOT NULL,
  metric_type  TEXT NOT NULL
                 CHECK (metric_type IN ('acquisition','activation','retention','revenue','referral')),
  definition   TEXT NOT NULL,
  target_value TEXT NOT NULL,
  current_value TEXT,
  timeframe    TEXT NOT NULL,
  owner        TEXT NOT NULL,
  data_source  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Market Intelligence tables
-- ============================================================

CREATE TABLE IF NOT EXISTS market_sizing (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  approach       TEXT NOT NULL CHECK (approach IN ('top_down','bottom_up')),
  tam_usd        NUMERIC,
  sam_usd        NUMERIC,
  som_usd        NUMERIC,
  tam_source     TEXT,
  sam_source     TEXT,
  som_source     TEXT,
  cagr_pct       NUMERIC,
  target_year    INTEGER,
  confidence     TEXT CHECK (confidence IN ('low','medium','high')),
  llm_reasoning  TEXT,
  fetched_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_trends (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  trend_title      TEXT NOT NULL,
  trend_summary    TEXT,
  source_url       TEXT,
  source_name      TEXT,
  signal_type      TEXT CHECK (signal_type IN ('regulatory','technology','consumer','competitive','macro')),
  sentiment        TEXT CHECK (sentiment IN ('positive','negative','neutral')),
  relevance_score  NUMERIC,
  published_at     TIMESTAMPTZ,
  fetched_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS funding_events (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id     UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  competitor_id  UUID REFERENCES competitors(id) ON DELETE SET NULL,
  company_name   TEXT NOT NULL,
  round_type     TEXT,
  amount_usd     NUMERIC,
  investors      TEXT[] NOT NULL DEFAULT '{}',
  announced_at   TIMESTAMPTZ,
  source_url     TEXT,
  fetched_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_buyer_personas (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id               UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  persona_name             TEXT NOT NULL,
  title                    TEXT NOT NULL,
  company_size             TEXT NOT NULL,
  industry_verticals       TEXT[] NOT NULL DEFAULT '{}',
  primary_job_to_be_done   TEXT NOT NULL,
  top_pains                TEXT[] NOT NULL DEFAULT '{}',
  desired_outcomes         TEXT[] NOT NULL DEFAULT '{}',
  buying_triggers          TEXT[] NOT NULL DEFAULT '{}',
  objections               TEXT[] NOT NULL DEFAULT '{}',
  willingness_to_pay       TEXT NOT NULL CHECK (willingness_to_pay IN ('low','medium','high','enterprise')),
  decision_making_role     TEXT NOT NULL CHECK (decision_making_role IN ('champion','decision_maker','influencer','end_user','blocker')),
  preferred_channels       TEXT[] NOT NULL DEFAULT '{}',
  key_quote                TEXT NOT NULL,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_risk_factors (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id               UUID NOT NULL REFERENCES analysis_sessions(id) ON DELETE CASCADE,
  risk_title               TEXT NOT NULL,
  risk_type                TEXT NOT NULL CHECK (risk_type IN ('market','competitive','regulatory','technology','execution','financial')),
  description              TEXT NOT NULL,
  probability              TEXT NOT NULL CHECK (probability IN ('low','medium','high')),
  impact                   TEXT NOT NULL CHECK (impact IN ('low','medium','high','critical')),
  mitigation               TEXT NOT NULL,
  early_warning_signals    TEXT[] NOT NULL DEFAULT '{}',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_gtm_plans_session_id ON gtm_plans(session_id);
CREATE INDEX IF NOT EXISTS idx_gtm_channels_plan_id ON gtm_channels(gtm_plan_id);
CREATE INDEX IF NOT EXISTS idx_gtm_experiments_plan_id ON gtm_experiments(gtm_plan_id);
CREATE INDEX IF NOT EXISTS idx_gtm_messaging_session_id ON gtm_messaging(session_id);
CREATE INDEX IF NOT EXISTS idx_gtm_launch_phases_session_id ON gtm_launch_phases(session_id);
CREATE INDEX IF NOT EXISTS idx_gtm_success_metrics_session_id ON gtm_success_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_market_sizing_session_id ON market_sizing(session_id);
CREATE INDEX IF NOT EXISTS idx_market_trends_session_id ON market_trends(session_id);
CREATE INDEX IF NOT EXISTS idx_market_buyer_personas_session_id ON market_buyer_personas(session_id);
CREATE INDEX IF NOT EXISTS idx_market_risk_factors_session_id ON market_risk_factors(session_id);
CREATE INDEX IF NOT EXISTS idx_funding_events_session_id ON funding_events(session_id);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE gtm_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE gtm_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE gtm_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gtm_messaging ENABLE ROW LEVEL SECURITY;
ALTER TABLE gtm_launch_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE gtm_success_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_sizing ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_buyer_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_events ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS: owner access via analysis_sessions.user_id
-- ============================================================

-- GTM plans: owner only
CREATE POLICY "Users can manage own gtm_plans"
  ON gtm_plans FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = gtm_plans.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own gtm_channels"
  ON gtm_channels FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gtm_plans
      JOIN analysis_sessions ON analysis_sessions.id = gtm_plans.session_id
      WHERE gtm_plans.id = gtm_channels.gtm_plan_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own gtm_experiments"
  ON gtm_experiments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gtm_plans
      JOIN analysis_sessions ON analysis_sessions.id = gtm_plans.session_id
      WHERE gtm_plans.id = gtm_experiments.gtm_plan_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own gtm_messaging"
  ON gtm_messaging FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = gtm_messaging.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own gtm_launch_phases"
  ON gtm_launch_phases FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = gtm_launch_phases.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own gtm_success_metrics"
  ON gtm_success_metrics FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = gtm_success_metrics.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own market_sizing"
  ON market_sizing FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = market_sizing.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own market_trends"
  ON market_trends FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = market_trends.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own market_buyer_personas"
  ON market_buyer_personas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = market_buyer_personas.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own market_risk_factors"
  ON market_risk_factors FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = market_risk_factors.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own funding_events"
  ON funding_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM analysis_sessions
      WHERE analysis_sessions.id = funding_events.session_id
        AND analysis_sessions.user_id = auth.uid()
    )
  );
