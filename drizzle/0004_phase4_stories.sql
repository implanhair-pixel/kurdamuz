-- Phase 4: Stories System Migration
-- This migration creates the database schema for the Stories module

-- Stories table
CREATE TABLE IF NOT EXISTS "stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"summary" text,
	"content" text NOT NULL,
	"cover_image_url" text,
	"estimated_reading_time" integer,
	"difficulty_level" text NOT NULL,
	"status" text NOT NULL,
	"is_featured" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "stories_slug_unique" UNIQUE("slug")
);

-- Story categories table
CREATE TABLE IF NOT EXISTS "story_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "story_categories_slug_unique" UNIQUE("slug")
);

-- Story category assignments (many-to-many)
CREATE TABLE IF NOT EXISTS "story_category_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Story dialects (many-to-many)
CREATE TABLE IF NOT EXISTS "story_dialects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"dialect_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Story tags table
CREATE TABLE IF NOT EXISTS "story_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "story_tags_slug_unique" UNIQUE("slug")
);

-- Story tag assignments (many-to-many)
CREATE TABLE IF NOT EXISTS "story_tag_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"story_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Story bookmarks table
CREATE TABLE IF NOT EXISTS "story_bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" uuid NOT NULL,
	"bookmark_position" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Story favorites table
CREATE TABLE IF NOT EXISTS "story_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Story progress table
CREATE TABLE IF NOT EXISTS "story_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" uuid NOT NULL,
	"completion_percentage" integer DEFAULT 0,
	"last_position" integer,
	"started_at" timestamp DEFAULT now(),
	"last_read_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);

-- Story completions table
CREATE TABLE IF NOT EXISTS "story_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" uuid NOT NULL,
	"completion_time" integer,
	"xp_awarded" integer,
	"completed_at" timestamp DEFAULT now()
);

-- Story recommendations table
CREATE TABLE IF NOT EXISTS "story_recommendations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"story_id" uuid NOT NULL,
	"recommendation_score" numeric NOT NULL,
	"recommendation_type" text NOT NULL,
	"generated_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "story_category_assignments" ADD CONSTRAINT "story_category_assignments_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "story_category_assignments" ADD CONSTRAINT "story_category_assignments_category_id_story_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."story_categories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "story_dialects" ADD CONSTRAINT "story_dialects_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "story_dialects" ADD CONSTRAINT "story_dialects_dialect_id_dialects_id_fk" FOREIGN KEY ("dialect_id") REFERENCES "public"."dialects"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "story_tag_assignments" ADD CONSTRAINT "story_tag_assignments_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "story_tag_assignments" ADD CONSTRAINT "story_tag_assignments_tag_id_story_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."story_tags"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "story_bookmarks" ADD CONSTRAINT "story_bookmarks_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "story_favorites" ADD CONSTRAINT "story_favorites_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "story_progress" ADD CONSTRAINT "story_progress_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "story_completions" ADD CONSTRAINT "story_completions_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "story_recommendations" ADD CONSTRAINT "story_recommendations_story_id_stories_id_fk" FOREIGN KEY ("story_id") REFERENCES "public"."stories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_stories_slug" ON "stories"("slug");
CREATE INDEX IF NOT EXISTS "idx_stories_difficulty_level" ON "stories"("difficulty_level");
CREATE INDEX IF NOT EXISTS "idx_stories_status" ON "stories"("status");
CREATE INDEX IF NOT EXISTS "idx_stories_is_featured" ON "stories"("is_featured");
CREATE INDEX IF NOT EXISTS "idx_stories_published_at" ON "stories"("published_at");

CREATE INDEX IF NOT EXISTS "idx_story_categories_slug" ON "story_categories"("slug");

CREATE INDEX IF NOT EXISTS "idx_story_category_assignments_story_id" ON "story_category_assignments"("story_id");
CREATE INDEX IF NOT EXISTS "idx_story_category_assignments_category_id" ON "story_category_assignments"("category_id");

CREATE INDEX IF NOT EXISTS "idx_story_dialects_story_id" ON "story_dialects"("story_id");
CREATE INDEX IF NOT EXISTS "idx_story_dialects_dialect_id" ON "story_dialects"("dialect_id");

CREATE INDEX IF NOT EXISTS "idx_story_tags_slug" ON "story_tags"("slug");

CREATE INDEX IF NOT EXISTS "idx_story_tag_assignments_story_id" ON "story_tag_assignments"("story_id");
CREATE INDEX IF NOT EXISTS "idx_story_tag_assignments_tag_id" ON "story_tag_assignments"("tag_id");

CREATE INDEX IF NOT EXISTS "idx_story_bookmarks_user_id" ON "story_bookmarks"("user_id");
CREATE INDEX IF NOT EXISTS "idx_story_bookmarks_story_id" ON "story_bookmarks"("story_id");

CREATE INDEX IF NOT EXISTS "idx_story_favorites_user_id" ON "story_favorites"("user_id");
CREATE INDEX IF NOT EXISTS "idx_story_favorites_story_id" ON "story_favorites"("story_id");

CREATE INDEX IF NOT EXISTS "idx_story_progress_user_id" ON "story_progress"("user_id");
CREATE INDEX IF NOT EXISTS "idx_story_progress_story_id" ON "story_progress"("story_id");
CREATE INDEX IF NOT EXISTS "idx_story_progress_completion_percentage" ON "story_progress"("completion_percentage");

CREATE INDEX IF NOT EXISTS "idx_story_completions_user_id" ON "story_completions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_story_completions_story_id" ON "story_completions"("story_id");

CREATE INDEX IF NOT EXISTS "idx_story_recommendations_user_id" ON "story_recommendations"("user_id");
CREATE INDEX IF NOT EXISTS "idx_story_recommendations_story_id" ON "story_recommendations"("story_id");
CREATE INDEX IF NOT EXISTS "idx_story_recommendations_generated_at" ON "story_recommendations"("generated_at");
