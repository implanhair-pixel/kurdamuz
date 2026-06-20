import { z } from 'zod';

// ============================================================================
// LEARNING PROGRAMS VALIDATION
// ============================================================================

export const learningProgramSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  programType: z.enum(['beginner', 'intermediate', 'advanced', 'specialized'], {
    required_error: 'Program type is required',
  }),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createLearningProgramSchema = learningProgramSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateLearningProgramSchema = learningProgramSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// LEARNING PATHS VALIDATION
// ============================================================================

export const learningPathSchema = z.object({
  id: z.string().uuid().optional(),
  programId: z.string().uuid('Invalid program ID'),
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().min(1, 'Slug is required').max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().max(1000).optional(),
  estimatedDuration: z.number().int().positive().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  active: z.boolean().default(true),
  createdAt: z.date().optional(),
});

export const createLearningPathSchema = learningPathSchema.omit({
  id: true,
  createdAt: true,
});

export const updateLearningPathSchema = learningPathSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// LEARNING MODULES VALIDATION
// ============================================================================

export const learningModuleSchema = z.object({
  id: z.string().uuid().optional(),
  pathId: z.string().uuid('Invalid path ID'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  sequenceOrder: z.number().int().nonnegative().default(0),
  estimatedDuration: z.number().int().positive().optional(),
  createdAt: z.date().optional(),
});

export const createLearningModuleSchema = learningModuleSchema.omit({
  id: true,
  createdAt: true,
});

export const updateLearningModuleSchema = learningModuleSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// LEARNING UNITS VALIDATION
// ============================================================================

export const learningUnitSchema = z.object({
  id: z.string().uuid().optional(),
  moduleId: z.string().uuid('Invalid module ID'),
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(1000).optional(),
  sequenceOrder: z.number().int().nonnegative().default(0),
  createdAt: z.date().optional(),
});

export const createLearningUnitSchema = learningUnitSchema.omit({
  id: true,
  createdAt: true,
});

export const updateLearningUnitSchema = learningUnitSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// LEARNING LESSONS VALIDATION
// ============================================================================

export const learningLessonSchema = z.object({
  id: z.string().uuid().optional(),
  unitId: z.string().uuid('Invalid unit ID'),
  title: z.string().min(1, 'Title is required').max(255),
  lessonType: z.enum(['video', 'text', 'interactive', 'assessment', 'practice'], {
    required_error: 'Lesson type is required',
  }),
  contentReference: z.string().optional(),
  estimatedDuration: z.number().int().positive().optional(),
  sequenceOrder: z.number().int().nonnegative().default(0),
  createdAt: z.date().optional(),
});

export const createLearningLessonSchema = learningLessonSchema.omit({
  id: true,
  createdAt: true,
});

export const updateLearningLessonSchema = learningLessonSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// LEARNING ACTIVITIES VALIDATION
// ============================================================================

export const learningActivitySchema = z.object({
  id: z.string().uuid().optional(),
  lessonId: z.string().uuid('Invalid lesson ID'),
  activityType: z.enum(['quiz', 'exercise', 'practice', 'reading', 'listening'], {
    required_error: 'Activity type is required',
  }),
  content: z.any().optional(),
  sequenceOrder: z.number().int().nonnegative().default(0),
  createdAt: z.date().optional(),
});

export const createLearningActivitySchema = learningActivitySchema.omit({
  id: true,
  createdAt: true,
});

export const updateLearningActivitySchema = learningActivitySchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// LEARNING ASSESSMENTS VALIDATION
// ============================================================================

export const learningAssessmentSchema = z.object({
  id: z.string().uuid().optional(),
  lessonId: z.string().uuid('Invalid lesson ID'),
  assessmentType: z.enum(['quiz', 'test', 'placement', 'final'], {
    required_error: 'Assessment type is required',
  }),
  passingScore: z.number().int().min(0).max(100).optional(),
  content: z.any().optional(),
  createdAt: z.date().optional(),
});

export const createLearningAssessmentSchema = learningAssessmentSchema.omit({
  id: true,
  createdAt: true,
});

export const updateLearningAssessmentSchema = learningAssessmentSchema.partial().extend({
  id: z.string().uuid(),
});

// ============================================================================
// USER LEARNING PROGRESS VALIDATION
// ============================================================================

export const userLearningProgressSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid('Invalid user ID'),
  pathId: z.string().uuid('Invalid path ID'),
  moduleId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  progressPercentage: z.number().int().min(0).max(100).default(0),
  completionStatus: z.enum(['not_started', 'in_progress', 'completed']).default('not_started'),
  completedAt: z.date().optional(),
  timeSpent: z.number().int().nonnegative().optional(),
  lastAccessedAt: z.date().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createUserLearningProgressSchema = userLearningProgressSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserLearningProgressSchema = userLearningProgressSchema.partial().extend({
  id: z.string().uuid(),
});

export const updateProgressSchema = z.object({
  userId: z.string().uuid(),
  pathId: z.string().uuid(),
  moduleId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  progressPercentage: z.number().int().min(0).max(100),
  completionStatus: z.enum(['not_started', 'in_progress', 'completed']),
  timeSpent: z.number().int().nonnegative().optional(),
});

// ============================================================================
// LEARNING CERTIFICATES VALIDATION
// ============================================================================

export const learningCertificateSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid('Invalid user ID'),
  pathId: z.string().uuid('Invalid path ID'),
  certificateNumber: z.string().optional(),
  issuedAt: z.date().optional(),
  status: z.enum(['issued', 'revoked']).default('issued'),
  certificateUrl: z.string().url().optional(),
  createdAt: z.date().optional(),
});

export const createLearningCertificateSchema = learningCertificateSchema.omit({
  id: true,
  createdAt: true,
});

export const updateLearningCertificateSchema = learningCertificateSchema.partial().extend({
  id: z.string().uuid(),
});

export const issueCertificateSchema = z.object({
  userId: z.string().uuid(),
  pathId: z.string().uuid(),
  certificateNumber: z.string().min(1, 'Certificate number is required'),
});

export const verifyCertificateSchema = z.object({
  certificateNumber: z.string().min(1, 'Certificate number is required'),
});

// ============================================================================
// LEARNING RECOMMENDATIONS VALIDATION
// ============================================================================

export const learningRecommendationSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid('Invalid user ID'),
  recommendationType: z.enum(['next_lesson', 'next_module', 'remedial', 'practice', 'certification'], {
    required_error: 'Recommendation type is required',
  }),
  recommendationData: z.any().optional(),
  confidenceScore: z.number().min(0).max(1).optional(),
  generatedAt: z.date().optional(),
  expiresAt: z.date().optional(),
  isDismissed: z.boolean().default(false),
});

export const createLearningRecommendationSchema = learningRecommendationSchema.omit({
  id: true,
  generatedAt: true,
});

export const updateLearningRecommendationSchema = learningRecommendationSchema.partial().extend({
  id: z.string().uuid(),
});

export const dismissRecommendationSchema = z.object({
  recommendationId: z.string().uuid(),
});

export const generateRecommendationsSchema = z.object({
  userId: z.string().uuid(),
  maxRecommendations: z.number().int().positive().default(5),
});

// ============================================================================
// ENROLLMENT VALIDATION
// ============================================================================

export const enrollInPathSchema = z.object({
  userId: z.string().uuid(),
  pathId: z.string().uuid(),
});

export const unenrollFromPathSchema = z.object({
  userId: z.string().uuid(),
  pathId: z.string().uuid(),
});

// ============================================================================
// AUDIT LOG VALIDATION
// ============================================================================

export const learningAuditLogSchema = z.object({
  id: z.string().uuid().optional(),
  actorId: z.string().uuid('Invalid actor ID'),
  actionType: z.enum(['created', 'updated', 'deleted', 'enrolled', 'completed', 'certified'], {
    required_error: 'Action type is required',
  }),
  targetType: z.enum(['program', 'path', 'module', 'lesson', 'progress', 'certificate'], {
    required_error: 'Target type is required',
  }),
  targetId: z.string().uuid('Invalid target ID'),
  oldValue: z.any().optional(),
  newValue: z.any().optional(),
  createdAt: z.date().optional(),
});

export const createLearningAuditLogSchema = learningAuditLogSchema.omit({
  id: true,
  createdAt: true,
});

// ============================================================================
// QUERY PARAMETER VALIDATION
// ============================================================================

export const learningPathsQuerySchema = z.object({
  programId: z.string().uuid().optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  active: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  search: z.string().optional(),
});

export const progressQuerySchema = z.object({
  userId: z.string().uuid(),
  pathId: z.string().uuid().optional(),
  moduleId: z.string().uuid().optional(),
  lessonId: z.string().uuid().optional(),
  completionStatus: z.enum(['not_started', 'in_progress', 'completed']).optional(),
});

export const analyticsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  programId: z.string().uuid().optional(),
  pathId: z.string().uuid().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  granularity: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
});

// ============================================================================
// BATCH OPERATIONS VALIDATION
// ============================================================================

export const batchUpdateProgressSchema = z.object({
  userId: z.string().uuid(),
  updates: z.array(
    z.object({
      pathId: z.string().uuid(),
      moduleId: z.string().uuid().optional(),
      lessonId: z.string().uuid().optional(),
      progressPercentage: z.number().int().min(0).max(100),
      completionStatus: z.enum(['not_started', 'in_progress', 'completed']),
      timeSpent: z.number().int().nonnegative().optional(),
    })
  ).min(1).max(50),
});

export const batchCreateModulesSchema = z.object({
  pathId: z.string().uuid(),
  modules: z.array(
    z.object({
      title: z.string().min(1).max(255),
      description: z.string().max(1000).optional(),
      sequenceOrder: z.number().int().nonnegative(),
      estimatedDuration: z.number().int().positive().optional(),
    })
  ).min(1).max(50),
});

export const batchCreateLessonsSchema = z.object({
  unitId: z.string().uuid(),
  lessons: z.array(
    z.object({
      title: z.string().min(1).max(255),
      lessonType: z.enum(['video', 'text', 'interactive', 'assessment', 'practice']),
      contentReference: z.string().optional(),
      estimatedDuration: z.number().int().positive().optional(),
      sequenceOrder: z.number().int().nonnegative(),
    })
  ).min(1).max(100),
});
