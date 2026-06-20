import { z } from 'zod';

// Story validation schemas
export const storySchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  summary: z.string().max(500).optional(),
  content: z.string().min(1),
  coverImageUrl: z.string().url().optional(),
  estimatedReadingTime: z.number().int().min(0).optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['draft', 'published', 'archived']),
  isFeatured: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
});

export const storyUpdateSchema = storySchema.partial();

export const storyCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
});

export const storyTagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
});

export const storyProgressSchema = z.object({
  storyId: z.string().uuid(),
  completionPercentage: z.number().int().min(0).max(100),
  lastPosition: z.number().int().min(0).optional(),
});

export const storyCompletionSchema = z.object({
  storyId: z.string().uuid(),
  completionTime: z.number().int().min(0).optional(),
});

export const storyBookmarkSchema = z.object({
  storyId: z.string().uuid(),
  bookmarkPosition: z.number().int().min(0),
});

export const storyFavoriteSchema = z.object({
  storyId: z.string().uuid(),
});

// Query parameter validation
export const storiesQuerySchema = z.object({
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('20'),
  category: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  search: z.string().optional(),
  featured: z.string().optional(),
});

// Validation functions
export function validateStory(data: unknown) {
  return storySchema.safeParse(data);
}

export function validateStoryUpdate(data: unknown) {
  return storyUpdateSchema.safeParse(data);
}

export function validateStoryProgress(data: unknown) {
  return storyProgressSchema.safeParse(data);
}

export function validateStoryCompletion(data: unknown) {
  return storyCompletionSchema.safeParse(data);
}

export function validateStoryBookmark(data: unknown) {
  return storyBookmarkSchema.safeParse(data);
}

export function validateStoryFavorite(data: unknown) {
  return storyFavoriteSchema.safeParse(data);
}

export function validateStoriesQuery(data: unknown) {
  return storiesQuerySchema.safeParse(data);
}
