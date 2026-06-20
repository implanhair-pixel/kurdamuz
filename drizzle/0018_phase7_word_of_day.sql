-- Phase 7: Word of the Day Workflow
-- This migration creates tables for the Word of the Day feature

-- Word of the Day table (current featured word)
CREATE TABLE IF NOT EXISTS word_of_day (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  word_data JSONB NOT NULL
);

-- Word of the Day history table (track all featured words)
CREATE TABLE IF NOT EXISTS word_of_day_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vocabulary_id UUID NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying current word of the day
CREATE INDEX IF NOT EXISTS idx_word_of_day_published 
ON word_of_day (published_at DESC);

-- Index for history queries
CREATE INDEX IF NOT EXISTS idx_word_of_day_history_published 
ON word_of_day_history (published_at DESC);

-- Index for vocabulary to prevent duplicates in history
CREATE INDEX IF NOT EXISTS idx_word_of_day_history_vocabulary 
ON word_of_day_history (vocabulary_id, published_at);
