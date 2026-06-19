-- MIGRATION NUMBERING AUDIT WARNING (2026-06-18):
-- This migration has a duplicate numeric prefix in the repository, and
-- drizzle/meta/_journal.json currently tracks only 0000_eager_tempest.
-- Drizzle uses migration filenames as identity/checksum inputs; do not rename
-- this file casually. Manually review ordering and production state before
-- running this migration against production.

-- Migration: Phase 13 Dialect Comparison Platform
-- This migration extends existing tables and creates new tables for dialect comparison capabilities

-- Extend dialects table with Phase 13 fields
ALTER TABLE "dialects" ADD COLUMN "region" text;
ALTER TABLE "dialects" ADD COLUMN "status" text DEFAULT 'active';
ALTER TABLE "dialects" ADD COLUMN "updated_at" timestamp DEFAULT now();

-- Extend vocabulary table to match lexical_entries schema
ALTER TABLE "vocabulary" ADD COLUMN "normalized_form" text;
ALTER TABLE "vocabulary" ADD COLUMN "part_of_speech" text;
ALTER TABLE "vocabulary" ADD COLUMN "root_form" text;
ALTER TABLE "vocabulary" ADD COLUMN "etymology" text;

-- Extend vocabulary_examples table with Phase 13 fields
ALTER TABLE "vocabulary_examples" ADD COLUMN "dialect_id" uuid;
ALTER TABLE "vocabulary_examples" ADD COLUMN "source_reference" text;

-- Create dialect_variants table
CREATE TABLE IF NOT EXISTS "dialect_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"dialect_id" uuid NOT NULL,
	"variant_form" text NOT NULL,
	"phonetic_form" text,
	"usage_frequency" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create lexical_meanings table
CREATE TABLE IF NOT EXISTS "lexical_meanings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"definition" text NOT NULL,
	"semantic_domain" text,
	"difficulty_level" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create linguistic_annotations table
CREATE TABLE IF NOT EXISTS "linguistic_annotations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entry_id" uuid NOT NULL,
	"annotation_type" text NOT NULL,
	"annotation_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create lexical_relationships table
CREATE TABLE IF NOT EXISTS "lexical_relationships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_entry_id" uuid NOT NULL,
	"target_entry_id" uuid NOT NULL,
	"relationship_type" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Create research_collections table
CREATE TABLE IF NOT EXISTS "research_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create dialect_audit_logs table
CREATE TABLE IF NOT EXISTS "dialect_audit_logs" (
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
 ALTER TABLE "vocabulary_examples" ADD CONSTRAINT "vocabulary_examples_dialect_id_dialects_id_fk" FOREIGN KEY ("dialect_id") REFERENCES "public"."dialects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "dialect_variants" ADD CONSTRAINT "dialect_variants_entry_id_vocabulary_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "dialect_variants" ADD CONSTRAINT "dialect_variants_dialect_id_dialects_id_fk" FOREIGN KEY ("dialect_id") REFERENCES "public"."dialects"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "lexical_meanings" ADD CONSTRAINT "lexical_meanings_entry_id_vocabulary_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "linguistic_annotations" ADD CONSTRAINT "linguistic_annotations_entry_id_vocabulary_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "lexical_relationships" ADD CONSTRAINT "lexical_relationships_source_entry_id_vocabulary_id_fk" FOREIGN KEY ("source_entry_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "lexical_relationships" ADD CONSTRAINT "lexical_relationships_target_entry_id_vocabulary_id_fk" FOREIGN KEY ("target_entry_id") REFERENCES "public"."vocabulary"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create GIN indexes for full-text search performance
CREATE INDEX IF NOT EXISTS "idx_vocabulary_normalized_form" ON "vocabulary" USING gin(to_tsvector('simple', "normalized_form"));
CREATE INDEX IF NOT EXISTS "idx_vocabulary_part_of_speech" ON "vocabulary"("part_of_speech");
CREATE INDEX IF NOT EXISTS "idx_vocabulary_root_form" ON "vocabulary" USING gin(to_tsvector('simple', "root_form"));
CREATE INDEX IF NOT EXISTS "idx_vocabulary_etymology" ON "vocabulary" USING gin(to_tsvector('simple', "etymology"));

CREATE INDEX IF NOT EXISTS "idx_dialect_variants_entry_id" ON "dialect_variants"("entry_id");
CREATE INDEX IF NOT EXISTS "idx_dialect_variants_dialect_id" ON "dialect_variants"("dialect_id");
CREATE INDEX IF NOT EXISTS "idx_dialect_variants_variant_form" ON "dialect_variants" USING gin(to_tsvector('simple', "variant_form"));

CREATE INDEX IF NOT EXISTS "idx_lexical_meanings_entry_id" ON "lexical_meanings"("entry_id");
CREATE INDEX IF NOT EXISTS "idx_lexical_meanings_semantic_domain" ON "lexical_meanings"("semantic_domain");
CREATE INDEX IF NOT EXISTS "idx_lexical_meanings_definition" ON "lexical_meanings" USING gin(to_tsvector('simple', "definition"));

CREATE INDEX IF NOT EXISTS "idx_linguistic_annotations_entry_id" ON "linguistic_annotations"("entry_id");
CREATE INDEX IF NOT EXISTS "idx_linguistic_annotations_annotation_type" ON "linguistic_annotations"("annotation_type");

CREATE INDEX IF NOT EXISTS "idx_lexical_relationships_source_entry_id" ON "lexical_relationships"("source_entry_id");
CREATE INDEX IF NOT EXISTS "idx_lexical_relationships_target_entry_id" ON "lexical_relationships"("target_entry_id");
CREATE INDEX IF NOT EXISTS "idx_lexical_relationships_relationship_type" ON "lexical_relationships"("relationship_type");

CREATE INDEX IF NOT EXISTS "idx_research_collections_user_id" ON "research_collections"("user_id");

CREATE INDEX IF NOT EXISTS "idx_dialect_audit_logs_actor_id" ON "dialect_audit_logs"("actor_id");
CREATE INDEX IF NOT EXISTS "idx_dialect_audit_logs_action_type" ON "dialect_audit_logs"("action_type");
CREATE INDEX IF NOT EXISTS "idx_dialect_audit_logs_target_id" ON "dialect_audit_logs"("target_id");
CREATE INDEX IF NOT EXISTS "idx_dialect_audit_logs_created_at" ON "dialect_audit_logs"("created_at");

CREATE INDEX IF NOT EXISTS "idx_dialects_region" ON "dialects"("region");
CREATE INDEX IF NOT EXISTS "idx_dialects_status" ON "dialects"("status");
CREATE INDEX IF NOT EXISTS "idx_dialects_updated_at" ON "dialects"("updated_at");
