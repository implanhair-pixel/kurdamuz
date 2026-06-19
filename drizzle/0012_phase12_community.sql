-- Phase 12: Community Platform Migration
-- This migration creates the database schema for the Community module

-- Community profiles table
CREATE TABLE IF NOT EXISTS "community_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"reputation_score" integer DEFAULT 0,
	"post_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "community_profiles_user_id_unique" UNIQUE("user_id")
);

-- Community posts table
CREATE TABLE IF NOT EXISTS "community_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"post_type" text NOT NULL DEFAULT 'discussion',
	"status" text NOT NULL DEFAULT 'draft',
	"visibility" text NOT NULL DEFAULT 'public',
	"reaction_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Community comments table
CREATE TABLE IF NOT EXISTS "community_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"content" text NOT NULL,
	"status" text NOT NULL DEFAULT 'published',
	"reaction_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Community reactions table
CREATE TABLE IF NOT EXISTS "community_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"reaction_type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Community reports table
CREATE TABLE IF NOT EXISTS "community_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"report_reason" text NOT NULL,
	"report_details" text,
	"status" text NOT NULL DEFAULT 'pending',
	"reviewed_by" uuid,
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);

-- Moderation actions table
CREATE TABLE IF NOT EXISTS "moderation_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"moderator_id" uuid NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Community notifications table
CREATE TABLE IF NOT EXISTS "community_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"notification_type" text NOT NULL,
	"payload" jsonb,
	"read_status" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);

-- Community audit logs table
CREATE TABLE IF NOT EXISTS "community_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid NOT NULL,
	"action_type" text NOT NULL,
	"target_id" uuid NOT NULL,
	"old_value" jsonb,
	"new_value" jsonb,
	"created_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_community_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."community_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_parent_comment_id_community_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."community_comments"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_community_profiles_user_id" ON "community_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "idx_community_profiles_display_name" ON "community_profiles"("display_name");
CREATE INDEX IF NOT EXISTS "idx_community_profiles_reputation_score" ON "community_profiles"("reputation_score");

CREATE INDEX IF NOT EXISTS "idx_community_posts_user_id" ON "community_posts"("user_id");
CREATE INDEX IF NOT EXISTS "idx_community_posts_post_type" ON "community_posts"("post_type");
CREATE INDEX IF NOT EXISTS "idx_community_posts_status" ON "community_posts"("status");
CREATE INDEX IF NOT EXISTS "idx_community_posts_visibility" ON "community_posts"("visibility");
CREATE INDEX IF NOT EXISTS "idx_community_posts_created_at" ON "community_posts"("created_at");

CREATE INDEX IF NOT EXISTS "idx_community_comments_post_id" ON "community_comments"("post_id");
CREATE INDEX IF NOT EXISTS "idx_community_comments_user_id" ON "community_comments"("user_id");
CREATE INDEX IF NOT EXISTS "idx_community_comments_parent_comment_id" ON "community_comments"("parent_comment_id");
CREATE INDEX IF NOT EXISTS "idx_community_comments_status" ON "community_comments"("status");

CREATE INDEX IF NOT EXISTS "idx_community_reactions_user_id" ON "community_reactions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_community_reactions_target_type" ON "community_reactions"("target_type");
CREATE INDEX IF NOT EXISTS "idx_community_reactions_target_id" ON "community_reactions"("target_id");
CREATE INDEX IF NOT EXISTS "idx_community_reactions_reaction_type" ON "community_reactions"("reaction_type");

CREATE INDEX IF NOT EXISTS "idx_community_reports_reporter_id" ON "community_reports"("reporter_id");
CREATE INDEX IF NOT EXISTS "idx_community_reports_target_type" ON "community_reports"("target_type");
CREATE INDEX IF NOT EXISTS "idx_community_reports_target_id" ON "community_reports"("target_id");
CREATE INDEX IF NOT EXISTS "idx_community_reports_status" ON "community_reports"("status");

CREATE INDEX IF NOT EXISTS "idx_moderation_actions_moderator_id" ON "moderation_actions"("moderator_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_actions_target_type" ON "moderation_actions"("target_type");
CREATE INDEX IF NOT EXISTS "idx_moderation_actions_target_id" ON "moderation_actions"("target_id");
CREATE INDEX IF NOT EXISTS "idx_moderation_actions_action_type" ON "moderation_actions"("action_type");

CREATE INDEX IF NOT EXISTS "idx_community_notifications_user_id" ON "community_notifications"("user_id");
CREATE INDEX IF NOT EXISTS "idx_community_notifications_notification_type" ON "community_notifications"("notification_type");
CREATE INDEX IF NOT EXISTS "idx_community_notifications_read_status" ON "community_notifications"("read_status");
CREATE INDEX IF NOT EXISTS "idx_community_notifications_created_at" ON "community_notifications"("created_at");

CREATE INDEX IF NOT EXISTS "idx_community_audit_logs_actor_id" ON "community_audit_logs"("actor_id");
CREATE INDEX IF NOT EXISTS "idx_community_audit_logs_action_type" ON "community_audit_logs"("action_type");
CREATE INDEX IF NOT EXISTS "idx_community_audit_logs_target_id" ON "community_audit_logs"("target_id");
CREATE INDEX IF NOT EXISTS "idx_community_audit_logs_created_at" ON "community_audit_logs"("created_at");
