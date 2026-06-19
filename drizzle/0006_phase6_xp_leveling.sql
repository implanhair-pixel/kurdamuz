-- Phase 6: XP and Leveling System Migration
-- This migration creates the database schema for the XP and Leveling module

-- XP transactions table - Stores all XP-related transactions
CREATE TABLE IF NOT EXISTS "xp_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"xp_amount" integer NOT NULL,
	"transaction_type" text NOT NULL,
	"source_type" text NOT NULL,
	"source_id" uuid,
	"description" text,
	"created_at" timestamp DEFAULT now()
);

-- User levels table - Maintains current progression state for each user
CREATE TABLE IF NOT EXISTS "user_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_level" integer NOT NULL DEFAULT 1,
	"current_xp" integer NOT NULL DEFAULT 0,
	"total_xp" integer NOT NULL DEFAULT 0,
	"xp_to_next_level" integer NOT NULL DEFAULT 100,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_levels_user_id_unique" UNIQUE("user_id")
);

-- Level definitions table - Defines configurable level thresholds
CREATE TABLE IF NOT EXISTS "level_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level_number" integer NOT NULL,
	"required_xp" integer NOT NULL,
	"title" text NOT NULL,
	"badge_id" uuid,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "level_definitions_level_number_unique" UNIQUE("level_number")
);

-- Rewards table - Stores all reward definitions
CREATE TABLE IF NOT EXISTS "rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"reward_type" text NOT NULL,
	"required_level" integer NOT NULL DEFAULT 1,
	"required_xp" integer NOT NULL DEFAULT 0,
	"active" boolean NOT NULL DEFAULT true,
	"created_at" timestamp DEFAULT now()
);

-- User rewards table - Tracks rewards earned and claimed by users
CREATE TABLE IF NOT EXISTS "user_rewards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reward_id" uuid NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"claimed_at" timestamp,
	"status" text NOT NULL DEFAULT 'available'
);

-- XP audit logs table - Immutable audit records for XP actions
CREATE TABLE IF NOT EXISTS "xp_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"target_user_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"reason" text,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "user_rewards" ADD CONSTRAINT "user_rewards_reward_id_rewards_id_fk" FOREIGN KEY ("reward_id") REFERENCES "public"."rewards"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_xp_transactions_user_id" ON "xp_transactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_xp_transactions_transaction_type" ON "xp_transactions"("transaction_type");
CREATE INDEX IF NOT EXISTS "idx_xp_transactions_source_type" ON "xp_transactions"("source_type");
CREATE INDEX IF NOT EXISTS "idx_xp_transactions_created_at" ON "xp_transactions"("created_at");

CREATE INDEX IF NOT EXISTS "idx_user_levels_user_id" ON "user_levels"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_levels_current_level" ON "user_levels"("current_level");
CREATE INDEX IF NOT EXISTS "idx_user_levels_total_xp" ON "user_levels"("total_xp");

CREATE INDEX IF NOT EXISTS "idx_level_definitions_level_number" ON "level_definitions"("level_number");
CREATE INDEX IF NOT EXISTS "idx_level_definitions_required_xp" ON "level_definitions"("required_xp");

CREATE INDEX IF NOT EXISTS "idx_rewards_reward_type" ON "rewards"("reward_type");
CREATE INDEX IF NOT EXISTS "idx_rewards_required_level" ON "rewards"("required_level");
CREATE INDEX IF NOT EXISTS "idx_rewards_active" ON "rewards"("active");

CREATE INDEX IF NOT EXISTS "idx_user_rewards_user_id" ON "user_rewards"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_rewards_reward_id" ON "user_rewards"("reward_id");
CREATE INDEX IF NOT EXISTS "idx_user_rewards_status" ON "user_rewards"("status");

CREATE INDEX IF NOT EXISTS "idx_xp_audit_logs_actor_id" ON "xp_audit_logs"("actor_id");
CREATE INDEX IF NOT EXISTS "idx_xp_audit_logs_target_user_id" ON "xp_audit_logs"("target_user_id");
CREATE INDEX IF NOT EXISTS "idx_xp_audit_logs_action_type" ON "xp_audit_logs"("action_type");
CREATE INDEX IF NOT EXISTS "idx_xp_audit_logs_created_at" ON "xp_audit_logs"("created_at");
