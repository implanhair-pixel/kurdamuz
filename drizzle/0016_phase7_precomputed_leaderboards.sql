-- Phase 7: Precomputed Leaderboards
-- This migration creates tables for precomputed leaderboards that are refreshed hourly

-- Precomputed leaderboard table (stores cached leaderboard data)
CREATE TABLE IF NOT EXISTS precomputed_leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leaderboard_type TEXT NOT NULL, -- 'xp', 'streak', 'reputation', 'coins'
  time_period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'all_time'
  rank INTEGER NOT NULL,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL,
  metadata JSONB,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Index for querying leaderboards
CREATE INDEX IF NOT EXISTS idx_precomputed_leaderboards_type_period 
ON precomputed_leaderboards (leaderboard_type, time_period, rank);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS idx_precomputed_leaderboards_user 
ON precomputed_leaderboards (user_id, leaderboard_type, time_period);

-- Index for validity check
CREATE INDEX IF NOT EXISTS idx_precomputed_leaderboards_valid_until 
ON precomputed_leaderboards (valid_until);
