import { z } from 'zod';

// ============================================================================
// VOCABULARY TYPES
// ============================================================================

export type DifficultyLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced';
export type VocabularyStatus = 'draft' | 'published' | 'archived';
export type RelationType = 'synonym' | 'antonym' | 'similar_meaning' | 'related_concept';

// Base vocabulary entry
export interface VocabularyEntry {
  id: string;
  kurdishWord: string;
  persianTranslation: string;
  englishTranslation?: string;
  pronunciation?: string;
  audioUrl?: string;
  difficultyLevel?: DifficultyLevel;
  frequencyRank?: number;
  status?: VocabularyStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Forward type declarations for circular references
import type { Dialect } from './dialects';
import type { VocabularyCategory, VocabularyTag } from './dialect';
import type { VocabularyProgress } from './review';

// Vocabulary with relations
export interface VocabularyWithRelations extends VocabularyEntry {
  dialects?: Dialect[];
  categories?: VocabularyCategory[];
  tags?: VocabularyTag[];
  examples?: VocabularyExample[];
  relations?: VocabularyRelation[];
}

// Vocabulary example sentence
export interface VocabularyExample {
  id: string;
  vocabularyId: string;
  kurdishSentence: string;
  persianTranslation: string;
  englishTranslation: string;
}

// Vocabulary relation (synonym, antonym, etc.)
export interface VocabularyRelation {
  id: string;
  sourceWordId: string;
  targetWordId: string;
  relationType: RelationType;
  targetWord?: VocabularyEntry;
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const difficultyLevelSchema = z.enum(['beginner', 'elementary', 'intermediate', 'advanced']);
export const vocabularyStatusSchema = z.enum(['draft', 'published', 'archived']);
export const relationTypeSchema = z.enum(['synonym', 'antonym', 'similar_meaning', 'related_concept']);

export const vocabularyEntrySchema = z.object({
  id: z.string().uuid(),
  kurdishWord: z.string().min(1).max(500),
  persianTranslation: z.string().min(1).max(500),
  englishTranslation: z.string().max(500).optional(),
  pronunciation: z.string().max(500).optional(),
  audioUrl: z.string().url().optional(),
  difficultyLevel: difficultyLevelSchema.optional(),
  frequencyRank: z.number().int().min(0).optional(),
  status: vocabularyStatusSchema.optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createVocabularySchema = z.object({
  kurdishWord: z.string().min(1).max(500),
  persianTranslation: z.string().min(1).max(500),
  englishTranslation: z.string().max(500).optional(),
  pronunciation: z.string().max(500).optional(),
  audioUrl: z.string().url().optional(),
  difficultyLevel: difficultyLevelSchema.optional(),
  frequencyRank: z.number().int().min(0).optional(),
  dialectIds: z.array(z.string().uuid()).optional(),
  categoryIds: z.array(z.string().uuid()).optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export const updateVocabularySchema = createVocabularySchema.partial().extend({
  id: z.string().uuid(),
});

export const vocabularyExampleSchema = z.object({
  id: z.string().uuid(),
  vocabularyId: z.string().uuid(),
  kurdishSentence: z.string().min(1).max(1000),
  persianTranslation: z.string().min(1).max(1000),
  englishTranslation: z.string().min(1).max(1000),
});

export const createVocabularyExampleSchema = z.object({
  vocabularyId: z.string().uuid(),
  kurdishSentence: z.string().min(1).max(1000),
  persianTranslation: z.string().min(1).max(1000),
  englishTranslation: z.string().min(1).max(1000),
});

export const vocabularyRelationSchema = z.object({
  id: z.string().uuid(),
  sourceWordId: z.string().uuid(),
  targetWordId: z.string().uuid(),
  relationType: relationTypeSchema,
});

export const createVocabularyRelationSchema = z.object({
  sourceWordId: z.string().uuid(),
  targetWordId: z.string().uuid(),
  relationType: relationTypeSchema,
});

// ============================================================================
// USER VOCABULARY TYPES
// ============================================================================

export interface UserVocabulary {
  id: string;
  userId: string;
  vocabularyId: string;
  savedAt: Date;
  isFavorite: boolean;
  notes?: string;
  vocabulary?: VocabularyEntry;
  progress?: VocabularyProgress;
}

export const createUserVocabularySchema = z.object({
  vocabularyId: z.string().uuid(),
  isFavorite: z.boolean().default(false),
  notes: z.string().max(2000).optional(),
});

export const updateUserVocabularySchema = z.object({
  id: z.string().uuid(),
  isFavorite: z.boolean().optional(),
  notes: z.string().max(2000).optional(),
});

export const toggleFavoriteSchema = z.object({
  vocabularyId: z.string().uuid(),
  isFavorite: z.boolean(),
});

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type CreateVocabularyInput = z.infer<typeof createVocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;
export type CreateVocabularyExampleInput = z.infer<typeof createVocabularyExampleSchema>;
export type CreateVocabularyRelationInput = z.infer<typeof createVocabularyRelationSchema>;
export type CreateUserVocabularyInput = z.infer<typeof createUserVocabularySchema>;
export type UpdateUserVocabularyInput = z.infer<typeof updateUserVocabularySchema>;
export type ToggleFavoriteInput = z.infer<typeof toggleFavoriteSchema>;
