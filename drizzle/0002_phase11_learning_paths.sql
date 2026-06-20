-- MIGRATION NUMBERING AUDIT WARNING (2026-06-18):
-- This migration has a duplicate numeric prefix in the repository, and
-- drizzle/meta/_journal.json currently tracks only 0000_eager_tempest.
-- Drizzle uses migration filenames as identity/checksum inputs; do not rename
-- this file casually. Manually review ordering and production state before
-- running this migration against production.

-- Phase 11: Learning Paths Migration
-- This migration creates the database schema for the Learning Paths framework

-- Learning programs table - Top-level program definitions
CREATE TABLE IF NOT EXISTS learning_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  program_type TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced', 'specialized'
  difficulty_level TEXT, -- 'beginner', 'intermediate', 'advanced'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'active', 'archived'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Learning paths table - Specific learning paths within programs
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES learning_programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  estimated_duration INTEGER, -- in minutes
  difficulty_level TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning modules table - Modules within learning paths
CREATE TABLE IF NOT EXISTS learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER DEFAULT 0,
  estimated_duration INTEGER, -- in minutes
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning units table - Units within modules
CREATE TABLE IF NOT EXISTS learning_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sequence_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning lessons table - Lessons within units
CREATE TABLE IF NOT EXISTS learning_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES learning_units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  lesson_type TEXT NOT NULL, -- 'video', 'text', 'interactive', 'assessment', 'practice'
  content_reference TEXT, -- reference to existing lessons table
  estimated_duration INTEGER, -- in minutes
  sequence_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning activities table - Activities within lessons
CREATE TABLE IF NOT EXISTS learning_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'quiz', 'exercise', 'practice', 'reading', 'listening'
  content JSONB,
  sequence_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning assessments table - Assessments within lessons
CREATE TABLE IF NOT EXISTS learning_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES learning_lessons(id) ON DELETE CASCADE,
  assessment_type TEXT NOT NULL, -- 'quiz', 'test', 'placement', 'final'
  passing_score INTEGER, -- percentage
  content JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User learning progress table - Tracks user progress through learning paths
CREATE TABLE IF NOT EXISTS user_learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  module_id UUID REFERENCES learning_modules(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES learning_lessons(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0,
  completion_status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
  completed_at TIMESTAMP,
  time_spent INTEGER, -- in seconds
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Learning certificates table - Certificates issued to users
CREATE TABLE IF NOT EXISTS learning_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  path_id UUID NOT NULL REFERENCES learning_paths(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE,
  issued_at TIMESTAMP DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'issued', -- 'issued', 'revoked'
  certificate_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Learning recommendations table - Personalized recommendations for users
CREATE TABLE IF NOT EXISTS learning_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'next_lesson', 'next_module', 'remedial', 'practice', 'certification'
  recommendation_data JSONB,
  confidence_score NUMERIC(5, 2),
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  is_dismissed BOOLEAN DEFAULT false
);

-- Learning audit logs table - Audit trail for learning paths operations
CREATE TABLE IF NOT EXISTS learning_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'enrolled', 'completed', 'certified'
  target_type TEXT NOT NULL, -- 'program', 'path', 'module', 'lesson', 'progress', 'certificate'
  target_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_learning_paths_program_id ON learning_paths(program_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_slug ON learning_paths(slug);
CREATE INDEX IF NOT EXISTS idx_learning_paths_active ON learning_paths(active);

CREATE INDEX IF NOT EXISTS idx_learning_modules_path_id ON learning_modules(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_sequence_order ON learning_modules(path_id, sequence_order);

CREATE INDEX IF NOT EXISTS idx_learning_units_module_id ON learning_units(module_id);
CREATE INDEX IF NOT EXISTS idx_learning_units_sequence_order ON learning_units(module_id, sequence_order);

CREATE INDEX IF NOT EXISTS idx_learning_lessons_unit_id ON learning_lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_learning_lessons_sequence_order ON learning_lessons(unit_id, sequence_order);

CREATE INDEX IF NOT EXISTS idx_learning_activities_lesson_id ON learning_activities(lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_assessments_lesson_id ON learning_assessments(lesson_id);

CREATE INDEX IF NOT EXISTS idx_user_learning_progress_user_id ON user_learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_path_id ON user_learning_progress(path_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_module_id ON user_learning_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_lesson_id ON user_learning_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_progress_completion_status ON user_learning_progress(completion_status);

CREATE INDEX IF NOT EXISTS idx_learning_certificates_user_id ON learning_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_certificates_path_id ON learning_certificates(path_id);
CREATE INDEX IF NOT EXISTS idx_learning_certificates_certificate_number ON learning_certificates(certificate_number);

CREATE INDEX IF NOT EXISTS idx_learning_recommendations_user_id ON learning_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_type ON learning_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_generated_at ON learning_recommendations(generated_at);
CREATE INDEX IF NOT EXISTS idx_learning_recommendations_is_dismissed ON learning_recommendations(is_dismissed);

CREATE INDEX IF NOT EXISTS idx_learning_audit_logs_actor_id ON learning_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_learning_audit_logs_target_type ON learning_audit_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_learning_audit_logs_target_id ON learning_audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_learning_audit_logs_created_at ON learning_audit_logs(created_at);
