import { z } from 'zod';

// ============================================================================
// SEARCH TYPES
// ============================================================================

export type SortOption = 
  | 'alphabetical'
  | 'recently_added'
  | 'most_reviewed'
  | 'most_saved'
  | 'frequency_rank'
  | 'difficulty_level'
  | 'review_due_date'
  | 'mastery_score'
  | 'popularity'
  | 'relevance';

export type SortDirection = 'asc' | 'desc';

export interface SearchFilters {
  query?: string;
  dialectIds?: string[];
  difficultyLevels?: string[];
  categories?: string[];
  tags?: string[];
  isFavorite?: boolean;
  notebookId?: string;
  learningStatus?: string[];
  status?: string[];
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: SortOption;
  sortDirection?: SortDirection;
  filters?: SearchFilters;
}

export interface SearchResult {
  vocabulary: any; // Will be VocabularyWithRelations
  relevanceScore?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const sortOptionSchema = z.enum([
  'alphabetical',
  'recently_added',
  'most_reviewed',
  'most_saved',
  'frequency_rank',
  'difficulty_level',
  'review_due_date',
  'mastery_score',
  'popularity',
  'relevance',
]);

export const sortDirectionSchema = z.enum(['asc', 'desc']);

export const searchFiltersSchema = z.object({
  query: z.string().max(500).optional(),
  dialectIds: z.array(z.string().uuid()).optional(),
  difficultyLevels: z.array(z.enum(['beginner', 'elementary', 'intermediate', 'advanced'])).optional(),
  categories: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string().uuid()).optional(),
  isFavorite: z.boolean().optional(),
  notebookId: z.string().uuid().optional(),
  learningStatus: z.array(z.enum(['new', 'learning', 'reviewing', 'mastered'])).optional(),
  status: z.array(z.enum(['draft', 'published', 'archived'])).optional(),
});

export const searchOptionsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: sortOptionSchema.default('relevance'),
  sortDirection: sortDirectionSchema.default('desc'),
  filters: searchFiltersSchema.optional(),
});

export const searchRequestSchema = searchOptionsSchema;

export const searchSuggestionSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().int().min(1).max(20).default(10),
});

// ============================================================================
// SEARCH RESULT TYPES
// ============================================================================

export interface SearchSuggestion {
  id: string;
  kurdishWord: string;
  persianTranslation: string;
  englishTranslation?: string;
  matchType: 'exact' | 'prefix' | 'fuzzy';
}

export interface SearchAnalytics {
  query: string;
  resultsCount: number;
  filtersApplied: string[];
  timestamp: Date;
  userId?: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type SearchOptionsInput = z.infer<typeof searchOptionsSchema>;
export type SearchRequestInput = z.infer<typeof searchRequestSchema>;
export type SearchSuggestionInput = z.infer<typeof searchSuggestionSchema>;
