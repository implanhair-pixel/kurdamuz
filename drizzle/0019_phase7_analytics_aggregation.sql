-- Phase 7: Analytics Aggregation with Event Batching
-- This migration creates tables for analytics event batching and daily summaries

-- Analytics events table (raw event data)
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics daily summary table (aggregated data)
CREATE TABLE IF NOT EXISTS analytics_daily_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  event_type TEXT NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 0,
  unique_users INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, event_type)
);

-- Index for querying unprocessed events
CREATE INDEX IF NOT EXISTS idx_analytics_events_processed 
ON analytics_events (processed, created_at);

-- Index for user analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_user 
ON analytics_events (user_id, created_at);

-- Index for event type queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_type 
ON analytics_events (event_type, created_at);

-- Index for daily summary queries
CREATE INDEX IF NOT EXISTS idx_analytics_daily_summary_date 
ON analytics_daily_summary (date DESC, event_type);
