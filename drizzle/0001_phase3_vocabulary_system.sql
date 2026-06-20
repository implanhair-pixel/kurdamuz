-- Migration: Phase 3 Vocabulary System
-- This migration adds comprehensive vocabulary management capabilities

-- Rename categories table to course_categories to avoid naming conflicts
ALTER TABLE "categories" RENAME TO "course_categories";

-- Extend vocabulary table with new fields
ALTER TABLE "vocabulary" ADD COLUMN "frequency_rank" integer;
ALTER TABLE "vocabulary" ADD COLUMN "status" text;
ALTER TABLE "vocabulary" ADD COLUMN "created_at" timestamp DEFAULT now();
ALTER TABLE "vocabulary" ADD COLUMN "updated_at" timestamp DEFAULT now();
ALTER TABLE "vocabulary" ALTER COLUMN "dialect_id" DROP NOT NULL;

-- Create dialects table
CREATE TABLE IF NOT EXISTS "dialects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "dialects_code_unique" UNIQUE("code")
);

-- Create vocabulary_categories table
CREATE TABLE IF NOT EXISTS "vocabulary_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	CONSTRAINT "vocabulary_categories_slug_unique" UNIQUE("slug")
);

-- Create vocabulary_tags table
CREATE TABLE IF NOT EXISTS "vocabulary_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "vocabulary_tags_slug_unique" UNIQUE("slug")
);

-- Create vocabulary_tag_assignments table
CREATE TABLE IF NOT EXISTS "vocabulary_tag_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);

-- Create vocabulary_examples table
CREATE TABLE IF NOT EXISTS "vocabulary_examples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"kurdish_sentence" text NOT NULL,
	"persian_translation" text NOT NULL,
	"english_translation" text NOT NULL
);

-- Create vocabulary_relations table
CREATE TABLE IF NOT EXISTS "vocabulary_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_word_id" uuid NOT NULL,
	"target_word_id" uuid NOT NULL,
	"relation_type" text NOT NULL
);

-- Create vocabulary_dialects table
CREATE TABLE IF NOT EXISTS "vocabulary_dialects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"dialect_id" uuid NOT NULL
);

-- Create user_vocabulary table
CREATE TABLE IF NOT EXISTS "user_vocabulary" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"saved_at" timestamp DEFAULT now(),
	"is_favorite" boolean DEFAULT false,
	"notes" text
);

-- Create vocabulary_notebooks table
CREATE TABLE IF NOT EXISTS "vocabulary_notebooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);

-- Create notebook_entries table
CREATE TABLE IF NOT EXISTS "notebook_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"notebook_id" uuid NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Create vocabulary_progress table
CREATE TABLE IF NOT EXISTS "vocabulary_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"mastery_score" integer DEFAULT 0,
	"review_count" integer DEFAULT 0,
	"correct_count" integer DEFAULT 0,
	"incorrect_count" integer DEFAULT 0,
	"last_reviewed_at" timestamp,
	"next_review_at" timestamp
);

-- Create review_sessions table
CREATE TABLE IF NOT EXISTS "review_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"total_words" integer DEFAULT 0,
	"correct_answers" integer DEFAULT 0
);

-- Create review_attempts table
CREATE TABLE IF NOT EXISTS "review_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"vocabulary_id" uuid NOT NULL,
	"response_quality" integer NOT NULL,
	"reviewed_at" timestamp DEFAULT now()
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "vocabulary_tag_assignments" ADD CONSTRAINT "vocabulary_tag_assignments_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "vocabulary_tag_assignments" ADD CONSTRAINT "vocabulary_tag_assignments_tag_id_vocabulary_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."vocabulary_tags"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "vocabulary_examples" ADD CONSTRAINT "vocabulary_examples_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "vocabulary_relations" ADD CONSTRAINT "vocabulary_relations_source_word_id_vocabulary_id_fk" FOREIGN KEY ("source_word_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "vocabulary_relations" ADD CONSTRAINT "vocabulary_relations_target_word_id_vocabulary_id_fk" FOREIGN KEY ("target_word_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "vocabulary_dialects" ADD CONSTRAINT "vocabulary_dialects_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "vocabulary_dialects" ADD CONSTRAINT "vocabulary_dialects_dialect_id_dialects_id_fk" FOREIGN KEY ("dialect_id") REFERENCES "public"."dialects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "notebook_entries" ADD CONSTRAINT "notebook_entries_notebook_id_vocabulary_notebooks_id_fk" FOREIGN KEY ("notebook_id") REFERENCES "public"."vocabulary_notebooks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "notebook_entries" ADD CONSTRAINT "notebook_entries_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "vocabulary_progress" ADD CONSTRAINT "vocabulary_progress_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "review_attempts" ADD CONSTRAINT "review_attempts_session_id_review_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."review_sessions"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "review_attempts" ADD CONSTRAINT "review_attempts_vocabulary_id_vocabulary_id_fk" FOREIGN KEY ("vocabulary_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Update foreign key for courses to reference course_categories
DO $$ BEGIN
 ALTER TABLE "courses" DROP CONSTRAINT IF EXISTS "courses_category_id_categories_id_fk";
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "courses" ADD CONSTRAINT "courses_category_id_course_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_categories"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for search performance
CREATE INDEX IF NOT EXISTS "idx_vocabulary_kurdish_word" ON "vocabulary" USING gin(to_tsvector('simple', "kurdish_word"));
CREATE INDEX IF NOT EXISTS "idx_vocabulary_persian_translation" ON "vocabulary" USING gin(to_tsvector('simple', "persian_translation"));
CREATE INDEX IF NOT EXISTS "idx_vocabulary_english_translation" ON "vocabulary" USING gin(to_tsvector('simple', "english_translation"));
CREATE INDEX IF NOT EXISTS "idx_vocabulary_difficulty_level" ON "vocabulary"("difficulty_level");
CREATE INDEX IF NOT EXISTS "idx_vocabulary_frequency_rank" ON "vocabulary"("frequency_rank");
CREATE INDEX IF NOT EXISTS "idx_vocabulary_status" ON "vocabulary"("status");

CREATE INDEX IF NOT EXISTS "idx_vocabulary_tag_assignments_vocabulary_id" ON "vocabulary_tag_assignments"("vocabulary_id");
CREATE INDEX IF NOT EXISTS "idx_vocabulary_tag_assignments_tag_id" ON "vocabulary_tag_assignments"("tag_id");

CREATE INDEX IF NOT EXISTS "idx_user_vocabulary_user_id" ON "user_vocabulary"("user_id");
CREATE INDEX IF NOT EXISTS "idx_user_vocabulary_vocabulary_id" ON "user_vocabulary"("vocabulary_id");
CREATE INDEX IF NOT EXISTS "idx_user_vocabulary_is_favorite" ON "user_vocabulary"("is_favorite");

CREATE INDEX IF NOT EXISTS "idx_vocabulary_notebooks_user_id" ON "vocabulary_notebooks"("user_id");

CREATE INDEX IF NOT EXISTS "idx_notebook_entries_notebook_id" ON "notebook_entries"("notebook_id");
CREATE INDEX IF NOT EXISTS "idx_notebook_entries_vocabulary_id" ON "notebook_entries"("vocabulary_id");

CREATE INDEX IF NOT EXISTS "idx_vocabulary_progress_user_id" ON "vocabulary_progress"("user_id");
CREATE INDEX IF NOT EXISTS "idx_vocabulary_progress_vocabulary_id" ON "vocabulary_progress"("vocabulary_id");
CREATE INDEX IF NOT EXISTS "idx_vocabulary_progress_next_review_at" ON "vocabulary_progress"("next_review_at");

CREATE INDEX IF NOT EXISTS "idx_review_sessions_user_id" ON "review_sessions"("user_id");

CREATE INDEX IF NOT EXISTS "idx_review_attempts_session_id" ON "review_attempts"("session_id");
CREATE INDEX IF NOT EXISTS "idx_review_attempts_vocabulary_id" ON "review_attempts"("vocabulary_id");
