import { z } from 'zod';

// ============================================================================
// DIALECT TYPES
// ============================================================================

export interface Dialect {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: Date;
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const dialectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  code: z.string().min(2).max(10).regex(/^[a-z0-9_-]+$/),
  description: z.string().max(500).optional(),
  createdAt: z.date(),
});

export const createDialectSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(2).max(10).regex(/^[a-z0-9_-]+$/),
  description: z.string().max(500).optional(),
});

export const updateDialectSchema = createDialectSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// VOCABULARY CATEGORY TYPES
// ============================================================================

export interface VocabularyCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export const vocabularyCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
});

export const createVocabularyCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
});

export const updateVocabularyCategorySchema = createVocabularyCategorySchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// VOCABULARY TAG TYPES
// ============================================================================

export interface VocabularyTag {
  id: string;
  name: string;
  slug: string;
}

export const vocabularyTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
});

export const createVocabularyTagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
});

export const updateVocabularyTagSchema = createVocabularyTagSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// VOCABULARY DIALECT ASSIGNMENT TYPES
// ============================================================================

export interface VocabularyDialectAssignment {
  id: string;
  vocabularyId: string;
  dialectId: string;
  dialect?: Dialect;
}

export const createVocabularyDialectAssignmentSchema = z.object({
  vocabularyId: z.string().uuid(),
  dialectId: z.string().uuid(),
});

// ============================================================================
// VOCABULARY TAG ASSIGNMENT TYPES
// ============================================================================

export interface VocabularyTagAssignment {
  id: string;
  vocabularyId: string;
  tagId: string;
  tag?: VocabularyTag;
}

export const createVocabularyTagAssignmentSchema = z.object({
  vocabularyId: z.string().uuid(),
  tagId: z.string().uuid(),
});

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type CreateDialectInput = z.infer<typeof createDialectSchema>;
export type UpdateDialectInput = z.infer<typeof updateDialectSchema>;
export type CreateVocabularyCategoryInput = z.infer<typeof createVocabularyCategorySchema>;
export type UpdateVocabularyCategoryInput = z.infer<typeof updateVocabularyCategorySchema>;
export type CreateVocabularyTagInput = z.infer<typeof createVocabularyTagSchema>;
export type UpdateVocabularyTagInput = z.infer<typeof updateVocabularyTagSchema>;
export type CreateVocabularyDialectAssignmentInput = z.infer<typeof createVocabularyDialectAssignmentSchema>;
export type CreateVocabularyTagAssignmentInput = z.infer<typeof createVocabularyTagAssignmentSchema>;
