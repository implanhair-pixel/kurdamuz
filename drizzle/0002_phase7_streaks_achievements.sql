-- MIGRATION NUMBERING AUDIT WARNING (2026-06-18):
-- This migration has a duplicate numeric prefix in the repository, and
-- drizzle/meta/_journal.json currently tracks only 0000_eager_tempest.
-- Drizzle uses migration filenames as identity/checksum inputs; do not rename
-- this file casually. Manually review ordering and production state before
-- running this migration against production.

-- Phase 7: Streaks and Achievements System
-- Migration for user streaks, streak history, recovery requests, and achievement audit logs

-- Create user_streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_activity_date DATE,
    streak_status TEXT NOT NULL DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create streak_history table
CREATE TABLE IF NOT EXISTS streak_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    activity_date DATE NOT NULL,
    streak_value INTEGER NOT NULL,
    activity_type TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create streak_recovery_requests table
CREATE TABLE IF NOT EXISTS streak_recovery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    missed_date DATE NOT NULL,
    recovery_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    reason TEXT,
    reviewed_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    reviewed_at TIMESTAMP
);

-- Create achievement_audit_logs table
CREATE TABLE IF NOT EXISTS achievement_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    target_user_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_status ON user_streaks(streak_status);
CREATE INDEX IF NOT EXISTS idx_streak_history_user_id ON streak_history(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_history_activity_date ON streak_history(activity_date);
CREATE INDEX IF NOT EXISTS idx_streak_recovery_requests_user_id ON streak_recovery_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_recovery_requests_status ON streak_recovery_requests(status);
CREATE INDEX IF NOT EXISTS idx_achievement_audit_logs_target_user_id ON achievement_audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_audit_logs_action_type ON achievement_audit_logs(action_type);
