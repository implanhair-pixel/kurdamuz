import { z } from 'zod';

// ============================================================================
// VOCABULARY NOTEBOOK TYPES
// ============================================================================

export interface VocabularyNotebook {
  id: string;
  userId: string;
  title: string;
  description?: string;
  createdAt: Date;
  entryCount?: number;
}

export interface NotebookEntry {
  id: string;
  notebookId: string;
  vocabularyId: string;
  createdAt: Date;
  vocabulary?: any; // Will be VocabularyEntry
}

export interface NotebookWithEntries extends VocabularyNotebook {
  entries?: NotebookEntry[];
}

// ============================================================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================================================

export const vocabularyNotebookSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  createdAt: z.date(),
});

export const createVocabularyNotebookSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
});

export const updateVocabularyNotebookSchema = createVocabularyNotebookSchema.partial().extend({
  id: z.string().uuid(),
});

export const notebookEntrySchema = z.object({
  id: z.string().uuid(),
  notebookId: z.string().uuid(),
  vocabularyId: z.string().uuid(),
  createdAt: z.date(),
});

export const createNotebookEntrySchema = z.object({
  notebookId: z.string().uuid(),
  vocabularyId: z.string().uuid(),
});

export const deleteNotebookEntrySchema = z.object({
  notebookId: z.string().uuid(),
  vocabularyId: z.string().uuid(),
});

export const bulkAddNotebookEntriesSchema = z.object({
  notebookId: z.string().uuid(),
  vocabularyIds: z.array(z.string().uuid()).min(1).max(100),
});

export const bulkRemoveNotebookEntriesSchema = z.object({
  notebookId: z.string().uuid(),
  vocabularyIds: z.array(z.string().uuid()).min(1).max(100),
});

// ============================================================================
// SMART COLLECTION TYPES
// ============================================================================

export type SmartCollectionType = 
  | 'recently_saved'
  | 'due_for_review'
  | 'difficult_words'
  | 'favorites'
  | 'mastered';

export interface SmartCollection {
  type: SmartCollectionType;
  name: string;
  description: string;
  icon?: string;
}

export const SMART_COLLECTIONS: Record<SmartCollectionType, SmartCollection> = {
  recently_saved: {
    type: 'recently_saved',
    name: 'Recently Saved',
    description: 'Words you saved recently',
    icon: 'clock',
  },
  due_for_review: {
    type: 'due_for_review',
    name: 'Due for Review',
    description: 'Words that need review today',
    icon: 'refresh-cw',
  },
  difficult_words: {
    type: 'difficult_words',
    name: 'Difficult Words',
    description: 'Words you struggle with',
    icon: 'alert-triangle',
  },
  favorites: {
    type: 'favorites',
    name: 'Favorites',
    description: 'Your favorite words',
    icon: 'heart',
  },
  mastered: {
    type: 'mastered',
    name: 'Mastered',
    description: 'Words you have mastered',
    icon: 'check-circle',
  },
};

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type CreateVocabularyNotebookInput = z.infer<typeof createVocabularyNotebookSchema>;
export type UpdateVocabularyNotebookInput = z.infer<typeof updateVocabularyNotebookSchema>;
export type CreateNotebookEntryInput = z.infer<typeof createNotebookEntrySchema>;
export type DeleteNotebookEntryInput = z.infer<typeof deleteNotebookEntrySchema>;
export type BulkAddNotebookEntriesInput = z.infer<typeof bulkAddNotebookEntriesSchema>;
export type BulkRemoveNotebookEntriesInput = z.infer<typeof bulkRemoveNotebookEntriesSchema>;
