-- Phase 10: Placement Test Tables
-- This migration adds tables for the comprehensive placement test system

-- Assessment questions table - Question bank with versioning
CREATE TABLE IF NOT EXISTS assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_type TEXT NOT NULL,
    skill_domain TEXT NOT NULL,
    difficulty_level TEXT NOT NULL,
    content JSONB NOT NULL,
    correct_answer JSONB NOT NULL,
    metadata JSONB,
    status TEXT NOT NULL DEFAULT 'active',
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment tests table - Test definitions
CREATE TABLE IF NOT EXISTS assessment_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    assessment_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Assessment sections table - Test sections by skill domain
CREATE TABLE IF NOT EXISTS assessment_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID NOT NULL REFERENCES assessment_tests(id) ON DELETE CASCADE,
    skill_domain TEXT NOT NULL,
    weight NUMERIC(5,2) NOT NULL DEFAULT 1.0,
    time_limit INTEGER,
    question_count INTEGER NOT NULL
);

-- Assessment attempts table - User test attempts
CREATE TABLE IF NOT EXISTS assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    test_id UUID NOT NULL REFERENCES assessment_tests(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'in_progress',
    overall_score NUMERIC(5,2),
    placement_level TEXT
);

-- Assessment responses table - Individual question responses
CREATE TABLE IF NOT EXISTS assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    response_data JSONB NOT NULL,
    score NUMERIC(5,2),
    evaluated_at TIMESTAMP
);

-- Placement results table - Final placement outcomes
CREATE TABLE IF NOT EXISTS placement_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    reading_score NUMERIC(5,2),
    writing_score NUMERIC(5,2),
    listening_score NUMERIC(5,2),
    speaking_score NUMERIC(5,2),
    grammar_score NUMERIC(5,2),
    vocabulary_score NUMERIC(5,2),
    overall_score NUMERIC(5,2) NOT NULL,
    recommended_level TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Assessment audit logs table - Audit trail
CREATE TABLE IF NOT EXISTS assessment_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    target_id UUID NOT NULL,
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assessment_questions_skill_domain ON assessment_questions(skill_domain);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_difficulty_level ON assessment_questions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_assessment_questions_status ON assessment_questions(status);
CREATE INDEX IF NOT EXISTS idx_assessment_sections_test_id ON assessment_sections(test_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_id ON assessment_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_test_id ON assessment_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_assessment_attempts_status ON assessment_attempts(status);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_attempt_id ON assessment_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_question_id ON assessment_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_placement_results_user_id ON placement_results(user_id);
CREATE INDEX IF NOT EXISTS idx_placement_results_attempt_id ON placement_results(attempt_id);
CREATE INDEX IF NOT EXISTS idx_assessment_audit_logs_actor_id ON assessment_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_assessment_audit_logs_target_id ON assessment_audit_logs(target_id);
CREATE INDEX IF NOT EXISTS idx_assessment_audit_logs_action_type ON assessment_audit_logs(action_type);
