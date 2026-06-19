-- Phase 5: Spaced Repetition System (SRS) Migration
-- This migration creates the database schema for the SRS module

-- SRS items table - All learning entities managed by SRS
CREATE TABLE IF NOT EXISTS "srs_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"content_type" text NOT NULL,
	"content_id" uuid NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- SRS reviews table - Review outcomes and performance indicators
CREATE TABLE IF NOT EXISTS "srs_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"srs_item_id" uuid NOT NULL,
	"review_quality" integer NOT NULL,
	"response_time" integer NOT NULL,
	"reviewed_at" timestamp DEFAULT now()
);

-- SRS schedules table - Scheduling parameters and retention metrics
CREATE TABLE IF NOT EXISTS "srs_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"srs_item_id" uuid NOT NULL,
	"next_review_at" timestamp NOT NULL,
	"current_interval" integer NOT NULL DEFAULT 0,
	"ease_factor" numeric(10,2) NOT NULL DEFAULT '2.5',
	"repetition_count" integer NOT NULL DEFAULT 0,
	"stability_score" numeric(10,2) NOT NULL DEFAULT '0',
	"difficulty_score" numeric(10,2) NOT NULL DEFAULT '0',
	"updated_at" timestamp DEFAULT now()
);

-- SRS review queues table - Daily queue metadata
CREATE TABLE IF NOT EXISTS "srs_review_queues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"queue_date" date NOT NULL,
	"total_items" integer NOT NULL DEFAULT 0,
	"generated_at" timestamp DEFAULT now()
);

-- SRS queue items table - Prioritized review items
CREATE TABLE IF NOT EXISTS "srs_queue_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"queue_id" uuid NOT NULL,
	"srs_item_id" uuid NOT NULL,
	"priority_score" numeric(10,2) NOT NULL DEFAULT '0',
	"status" text NOT NULL
);

-- SRS daily statistics table - Daily performance metrics
CREATE TABLE IF NOT EXISTS "srs_daily_statistics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"review_date" date NOT NULL,
	"reviews_completed" integer NOT NULL DEFAULT 0,
	"accuracy_percentage" numeric(5,2) NOT NULL DEFAULT '0',
	"retention_score" numeric(5,2) NOT NULL DEFAULT '0',
	"study_time" integer NOT NULL DEFAULT 0
);

-- SRS retention models table - Retention forecasts and mastery
CREATE TABLE IF NOT EXISTS "srs_retention_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"predicted_retention" numeric(5,2) NOT NULL DEFAULT '0',
	"mastery_score" numeric(5,2) NOT NULL DEFAULT '0',
	"forgetting_rate" numeric(5,2) NOT NULL DEFAULT '0',
	"updated_at" timestamp DEFAULT now()
);

-- SRS events table - Audit trail and event sourcing
CREATE TABLE IF NOT EXISTS "srs_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "srs_reviews" ADD CONSTRAINT "srs_reviews_srs_item_id_srs_items_id_fk" FOREIGN KEY ("srs_item_id") REFERENCES "public"."srs_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "srs_schedules" ADD CONSTRAINT "srs_schedules_srs_item_id_srs_items_id_fk" FOREIGN KEY ("srs_item_id") REFERENCES "public"."srs_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "srs_queue_items" ADD CONSTRAINT "srs_queue_items_queue_id_srs_review_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."srs_review_queues"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "srs_queue_items" ADD CONSTRAINT "srs_queue_items_srs_item_id_srs_items_id_fk" FOREIGN KEY ("srs_item_id") REFERENCES "public"."srs_items"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_srs_items_user_id" ON "srs_items"("user_id");
CREATE INDEX IF NOT EXISTS "idx_srs_items_content_type" ON "srs_items"("content_type");
CREATE INDEX IF NOT EXISTS "idx_srs_items_content_id" ON "srs_items"("content_id");
CREATE INDEX IF NOT EXISTS "idx_srs_items_status" ON "srs_items"("status");

CREATE INDEX IF NOT EXISTS "idx_srs_reviews_user_id" ON "srs_reviews"("user_id");
CREATE INDEX IF NOT EXISTS "idx_srs_reviews_srs_item_id" ON "srs_reviews"("srs_item_id");
CREATE INDEX IF NOT EXISTS "idx_srs_reviews_reviewed_at" ON "srs_reviews"("reviewed_at");

CREATE INDEX IF NOT EXISTS "idx_srs_schedules_srs_item_id" ON "srs_schedules"("srs_item_id");
CREATE INDEX IF NOT EXISTS "idx_srs_schedules_next_review_at" ON "srs_schedules"("next_review_at");

CREATE INDEX IF NOT EXISTS "idx_srs_review_queues_user_id" ON "srs_review_queues"("user_id");
CREATE INDEX IF NOT EXISTS "idx_srs_review_queues_queue_date" ON "srs_review_queues"("queue_date");

CREATE INDEX IF NOT EXISTS "idx_srs_queue_items_queue_id" ON "srs_queue_items"("queue_id");
CREATE INDEX IF NOT EXISTS "idx_srs_queue_items_srs_item_id" ON "srs_queue_items"("srs_item_id");
CREATE INDEX IF NOT EXISTS "idx_srs_queue_items_status" ON "srs_queue_items"("status");

CREATE INDEX IF NOT EXISTS "idx_srs_daily_statistics_user_id" ON "srs_daily_statistics"("user_id");
CREATE INDEX IF NOT EXISTS "idx_srs_daily_statistics_review_date" ON "srs_daily_statistics"("review_date");

CREATE INDEX IF NOT EXISTS "idx_srs_retention_models_user_id" ON "srs_retention_models"("user_id");

CREATE INDEX IF NOT EXISTS "idx_srs_events_user_id" ON "srs_events"("user_id");
CREATE INDEX IF NOT EXISTS "idx_srs_events_event_type" ON "srs_events"("event_type");
CREATE INDEX IF NOT EXISTS "idx_srs_events_created_at" ON "srs_events"("created_at");
