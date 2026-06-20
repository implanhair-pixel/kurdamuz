import { z } from 'zod';

// ============================================================================
// POST VALIDATIONS
// ============================================================================

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be less than 10000 characters'),
  postType: z.enum(['discussion', 'question', 'tip', 'experience', 'success', 'course_discussion', 'announcement', 'update']).default('discussion'),
  visibility: z.enum(['public', 'private', 'restricted']).default('public'),
});

export const updatePostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be less than 10000 characters').optional(),
  postType: z.enum(['discussion', 'question', 'tip', 'experience', 'success', 'course_discussion', 'announcement', 'update']).optional(),
  visibility: z.enum(['public', 'private', 'restricted']).optional(),
  status: z.enum(['draft', 'published', 'reported', 'under_review', 'approved', 'removed', 'archived']).optional(),
});

// ============================================================================
// COMMENT VALIDATIONS
// ============================================================================

export const createCommentSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
  content: z.string().min(1, 'Content is required').max(5000, 'Comment must be less than 5000 characters'),
  parentCommentId: z.string().uuid('Invalid parent comment ID').optional(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Content is required').max(5000, 'Comment must be less than 5000 characters'),
  status: z.enum(['published', 'reported', 'removed']).optional(),
});

// ============================================================================
// REACTION VALIDATIONS
// ============================================================================

export const createReactionSchema = z.object({
  targetType: z.enum(['post', 'comment']),
  targetId: z.string().uuid('Invalid target ID'),
  reactionType: z.enum(['like', 'helpful', 'insightful', 'celebrate', 'support']),
});

// ============================================================================
// REPORT VALIDATIONS
// ============================================================================

export const createReportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'user']),
  targetId: z.string().uuid('Invalid target ID'),
  reportReason: z.enum(['spam', 'harassment', 'hate_speech', 'misinformation', 'inappropriate', 'copyright', 'self_harm', 'other']),
  reportDetails: z.string().max(1000, 'Details must be less than 1000 characters').optional(),
});

export const updateReportSchema = z.object({
  status: z.enum(['pending', 'under_review', 'resolved', 'dismissed']),
});

// ============================================================================
// PROFILE VALIDATIONS
// ============================================================================

export const createProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name must be less than 50 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
});

export const updateProfileSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name must be less than 50 characters').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional(),
});

// ============================================================================
// MODERATION ACTION VALIDATIONS
// ============================================================================

export const createModerationActionSchema = z.object({
  targetType: z.enum(['post', 'comment', 'user']),
  targetId: z.string().uuid('Invalid target ID'),
  actionType: z.enum(['approve', 'remove', 'restore', 'warn', 'restrict_temp', 'restrict_perm', 'escalate', 'review_account']),
  reason: z.string().min(1, 'Reason is required').max(1000, 'Reason must be less than 1000 characters'),
});

// ============================================================================
// NOTIFICATION VALIDATIONS
// ============================================================================

export const updateNotificationSchema = z.object({
  readStatus: z.boolean(),
});

// ============================================================================
// SEARCH VALIDATIONS
// ============================================================================

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(200, 'Query must be less than 200 characters'),
  type: z.enum(['posts', 'comments', 'users', 'all']).default('all'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});
