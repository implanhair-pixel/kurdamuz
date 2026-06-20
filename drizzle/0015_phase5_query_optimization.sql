-- Phase 5: Query Optimization - Composite Indexes and GIN Indexes
-- This migration adds composite indexes for frequently queried columns
-- and GIN indexes for full-text search on text fields

-- Composite index for community posts (user_id + status + created_at)
CREATE INDEX IF NOT EXISTS idx_community_posts_user_status_created 
ON community_posts (user_id, status, created_at DESC);

-- Composite index for community comments (user_id + status + created_at)
CREATE INDEX IF NOT EXISTS idx_community_comments_user_status_created 
ON community_comments (user_id, status, created_at DESC);

-- Composite index for notifications (user_id + read_status + created_at)
CREATE INDEX IF NOT EXISTS idx_community_notifications_user_read_created 
ON community_notifications (user_id, read_status, created_at DESC);

-- Composite index for user progress (user_id + lesson_id)
CREATE INDEX IF NOT EXISTS idx_user_progress_user_lesson 
ON user_progress (user_id, lesson_id);

-- Composite index for user missions (user_id + completion_status)
CREATE INDEX IF NOT EXISTS idx_user_missions_user_status 
ON user_missions (user_id, completion_status);

-- Composite index for user streaks (user_id + streak_status)
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_status 
ON user_streaks (user_id, streak_status);

-- GIN index for vocabulary full-text search (kurdish_word)
CREATE INDEX IF NOT EXISTS idx_vocabulary_kurdish_word_gin 
ON vocabulary USING gin (to_tsvector('simple', kurdish_word));

-- GIN index for vocabulary full-text search (persian_translation)
CREATE INDEX IF NOT EXISTS idx_vocabulary_persian_gin 
ON vocabulary USING gin (to_tsvector('simple', persian_translation));

-- GIN index for vocabulary full-text search (english_translation)
CREATE INDEX IF NOT EXISTS idx_vocabulary_english_gin 
ON vocabulary USING gin (to_tsvector('simple', english_translation));

-- Composite index for vocabulary (difficulty_level + status)
CREATE INDEX IF NOT EXISTS idx_vocabulary_difficulty_status 
ON vocabulary (difficulty_level, status);

-- Composite index for stories (status + difficulty_level + published_at)
CREATE INDEX IF NOT EXISTS idx_stories_status_difficulty_published 
ON stories (status, difficulty_level, published_at DESC);

-- Composite index for story progress (user_id + story_id)
CREATE INDEX IF NOT EXISTS idx_story_progress_user_story 
ON story_progress (user_id, story_id);

-- Composite index for SRS items (user_id + status + next_review_at)
CREATE INDEX IF NOT EXISTS idx_srs_items_user_status_review 
ON srs_items (user_id, status, next_review_at);

-- Composite index for SRS schedules (srs_item_id + next_review_at)
CREATE INDEX IF NOT EXISTS idx_srs_schedules_item_review 
ON srs_schedules (srs_item_id, next_review_at);

-- Composite index for challenge scores (user_id + schedule_id + final_score)
CREATE INDEX IF NOT EXISTS idx_challenge_scores_user_schedule_score 
ON challenge_scores (user_id, schedule_id, final_score DESC);
