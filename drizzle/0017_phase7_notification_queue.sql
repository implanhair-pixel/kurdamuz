-- Phase 7: Async Notification Delivery Queue
-- This migration creates tables for asynchronous notification delivery

-- Notification queue table
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, sent, failed
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
);

-- Index for querying pending notifications
CREATE INDEX IF NOT EXISTS idx_notification_queue_status_scheduled 
ON notification_queue (status, scheduled_at);

-- Index for user notifications
CREATE INDEX IF NOT EXISTS idx_notification_queue_user 
ON notification_queue (user_id, status);

-- Index for retrying failed notifications
CREATE INDEX IF NOT EXISTS idx_notification_queue_failed 
ON notification_queue (status, attempts) WHERE status = 'failed';
