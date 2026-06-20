-- MIGRATION NUMBERING AUDIT WARNING (2026-06-18):
-- This migration has a duplicate numeric prefix in the repository, and
-- drizzle/meta/_journal.json currently tracks only 0000_eager_tempest.
-- Drizzle uses migration filenames as identity/checksum inputs; do not rename
-- this file casually. Manually review ordering and production state before
-- running this migration against production.

-- Challenge Definitions Table
CREATE TABLE IF NOT EXISTS challenge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL,
  difficulty_level TEXT NOT NULL,
  content_config JSONB,
  scoring_rules JSONB,
  time_limit INTEGER,
  max_attempts INTEGER,
  xp_reward INTEGER NOT NULL DEFAULT 0,
  badge_reward UUID,
  is_public BOOLEAN DEFAULT true,
  created_by UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Challenge Schedules Table
CREATE TABLE IF NOT EXISTS challenge_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_definition_id UUID NOT NULL REFERENCES challenge_definitions(id),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  status TEXT NOT NULL DEFAULT 'draft',
  publication_status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Challenge Submissions Table
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES challenge_schedules(id),
  user_id UUID NOT NULL,
  submission_data JSONB NOT NULL,
  submitted_at TIMESTAMP DEFAULT NOW(),
  time_taken INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  review_status TEXT NOT NULL DEFAULT 'automatic',
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  fraud_score INTEGER DEFAULT 0,
  is_duplicate BOOLEAN DEFAULT false,
  duplicate_of UUID
);

-- Challenge Scores Table
CREATE TABLE IF NOT EXISTS challenge_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES challenge_submissions(id),
  user_id UUID NOT NULL,
  schedule_id UUID NOT NULL REFERENCES challenge_schedules(id),
  base_score INTEGER NOT NULL,
  time_bonus INTEGER DEFAULT 0,
  difficulty_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.0,
  streak_bonus INTEGER DEFAULT 0,
  achievement_bonus INTEGER DEFAULT 0,
  final_score INTEGER NOT NULL,
  rank INTEGER,
  percentile NUMERIC(5,2),
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Challenge Rewards Table
CREATE TABLE IF NOT EXISTS challenge_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  score_id UUID NOT NULL REFERENCES challenge_scores(id),
  user_id UUID NOT NULL,
  reward_type TEXT NOT NULL,
  reward_value JSONB NOT NULL,
  awarded_at TIMESTAMP DEFAULT NOW(),
  is_claimed BOOLEAN DEFAULT false,
  claimed_at TIMESTAMP
);

-- Challenge Leaderboards Table
CREATE TABLE IF NOT EXISTS challenge_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES challenge_schedules(id),
  user_id UUID NOT NULL,
  leaderboard_type TEXT NOT NULL,
  scope TEXT NOT NULL,
  scope_id UUID,
  score INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  previous_rank INTEGER,
  change INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Challenge Audit Logs Table
CREATE TABLE IF NOT EXISTS challenge_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  user_id UUID NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  changes JSONB,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_challenge_schedules_date ON challenge_schedules(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_challenge_schedules_status ON challenge_schedules(status);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_user ON challenge_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_submissions_schedule ON challenge_submissions(schedule_id);
CREATE INDEX IF NOT EXISTS idx_challenge_scores_user ON challenge_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_scores_schedule ON challenge_scores(schedule_id);
CREATE INDEX IF NOT EXISTS idx_challenge_leaderboards_type ON challenge_leaderboards(leaderboard_type);
CREATE INDEX IF NOT EXISTS idx_challenge_leaderboards_scope ON challenge_leaderboards(scope, scope_id);
CREATE INDEX IF NOT EXISTS idx_challenge_audit_logs_entity ON challenge_audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_challenge_audit_logs_user ON challenge_audit_logs(user_id);
