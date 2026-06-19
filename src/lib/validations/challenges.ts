// src/lib/validations/challenges.ts
import * as z from 'zod';

export const challengeTypeSchema = z.enum([
  'quiz',
  'vocabulary',
  'translation',
  'listening',
  'reading',
  'writing',
  'grammar',
  'timed',
  'streak',
  'xp',
  'teacher_created',
  'event',
  'seasonal',
]);

export const difficultyLevelSchema = z.enum([
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);

export const scoringRulesSchema = z.object({
  basePoints: z.number().min(0).max(10000),
  timeBonusEnabled: z.boolean().default(false),
  timeBonusDecay: z.number().min(0).max(100).default(0),
  difficultyMultiplier: z.record(difficultyLevelSchema, z.number().min(0.5).max(5)),
  streakBonusEnabled: z.boolean().default(false),
  streakBonusPerDay: z.number().min(0).max(1000).default(0),
  achievementBonusEnabled: z.boolean().default(false),
  maxScore: z.number().min(0).max(100000),
});

export const createChallengeDefinitionSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  challengeType: challengeTypeSchema,
  difficultyLevel: difficultyLevelSchema,
  contentConfig: z.record(z.any()),
  scoringRules: scoringRulesSchema,
  timeLimit: z.number().min(60).max(86400).optional(), // 1 minute to 24 hours
  maxAttempts: z.number().min(1).max(10).optional(),
  xpReward: z.number().min(0).max(10000),
  badgeReward: z.string().uuid().optional(),
  isPublic: z.boolean().default(true),
});

export const updateChallengeDefinitionSchema = createChallengeDefinitionSchema.partial().extend({
  id: z.string().uuid(),
});

export const createChallengeScheduleSchema = z.object({
  challengeDefinitionId: z.string().uuid(),
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  scheduledDate: z.coerce.date(),
  scheduledTime: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  timezone: z.string().default('UTC'),
});

export const updateChallengeScheduleSchema = createChallengeScheduleSchema.partial().extend({
  id: z.string().uuid(),
});

export const submitChallengeSchema = z.object({
  scheduleId: z.string().uuid(),
  submissionData: z.record(z.any()),
  timeTaken: z.number().min(0).max(86400).optional(),
});

export const reviewSubmissionSchema = z.object({
  submissionId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'flag']),
  reviewNotes: z.string().max(1000).optional(),
});

export const getLeaderboardSchema = z.object({
  scheduleId: z.string().uuid().optional(),
  leaderboardType: z.enum([
    'daily',
    'weekly',
    'monthly',
    'challenge',
    'course',
    'global',
    'classroom',
    'seasonal',
  ]),
  scope: z.enum(['global', 'classroom', 'course']).optional(),
  scopeId: z.string().uuid().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export const approveScheduleSchema = z.object({
  scheduleId: z.string().uuid(),
  approved: z.boolean(),
  notes: z.string().max(1000).optional(),
});

export const claimRewardSchema = z.object({
  rewardId: z.string().uuid(),
});

export const publishScheduleSchema = z.object({
  scheduleId: z.string().uuid(),
});

// Type exports
export type CreateChallengeDefinitionInput = z.infer<typeof createChallengeDefinitionSchema>;
export type UpdateChallengeDefinitionInput = z.infer<typeof updateChallengeDefinitionSchema>;
export type CreateChallengeScheduleInput = z.infer<typeof createChallengeScheduleSchema>;
export type UpdateChallengeScheduleInput = z.infer<typeof updateChallengeScheduleSchema>;
export type SubmitChallengeInput = z.infer<typeof submitChallengeSchema>;
export type ReviewSubmissionInput = z.infer<typeof reviewSubmissionSchema>;
export type GetLeaderboardInput = z.infer<typeof getLeaderboardSchema>;
export type ApproveScheduleInput = z.infer<typeof approveScheduleSchema>;
export type ClaimRewardInput = z.infer<typeof claimRewardSchema>;
export type PublishScheduleInput = z.infer<typeof publishScheduleSchema>;
