-- MIGRATION NUMBERING AUDIT WARNING (2026-06-18):
-- This migration has a duplicate numeric prefix in the repository, and
-- drizzle/meta/_journal.json currently tracks only 0000_eager_tempest.
-- Drizzle uses migration filenames as identity/checksum inputs; do not rename
-- this file casually. Manually review ordering and production state before
-- running this migration against production.

-- Phase 9.2: Mission System Tables
-- Migration for mission_definitions, mission_schedules, user_missions, and mission_history

-- Create mission_definitions table
CREATE TABLE IF NOT EXISTS mission_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    mission_type TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    criteria JSONB,
    xp_reward INTEGER NOT NULL,
    coin_reward INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create mission_schedules table
CREATE TABLE IF NOT EXISTS mission_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES mission_definitions(id),
    start_at TIMESTAMP,
    end_at TIMESTAMP,
    reset_policy TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_missions table
CREATE TABLE IF NOT EXISTS user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    mission_id UUID NOT NULL REFERENCES mission_definitions(id),
    progress_value INTEGER DEFAULT 0,
    completion_status TEXT NOT NULL,
    xp_awarded INTEGER DEFAULT 0,
    coin_awarded INTEGER DEFAULT 0,
    completed_at TIMESTAMP
);

-- Create mission_history table
CREATE TABLE IF NOT EXISTS mission_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    mission_id UUID NOT NULL REFERENCES mission_definitions(id),
    completion_result TEXT NOT NULL,
    reward_snapshot JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_mission_definitions_mission_type ON mission_definitions(mission_type);
CREATE INDEX IF NOT EXISTS idx_mission_definitions_active ON mission_definitions(active);
CREATE INDEX IF NOT EXISTS idx_mission_schedules_mission_id ON mission_schedules(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_schedules_status ON mission_schedules(status);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_mission_id ON user_missions(mission_id);
CREATE INDEX IF NOT EXISTS idx_user_missions_completion_status ON user_missions(completion_status);
CREATE INDEX IF NOT EXISTS idx_mission_history_user_id ON mission_history(user_id);
CREATE INDEX IF NOT EXISTS idx_mission_history_mission_id ON mission_history(mission_id);
