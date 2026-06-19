import {
  learningPrograms,
  learningPaths,
  learningModules,
  learningUnits,
  learningLessons,
  learningActivities,
  learningAssessments,
  userLearningProgress,
  learningCertificates,
  learningRecommendations,
  learningAuditLogs,
} from '@/db/schema';

// ============================================================================
// LEARNING PATHS TYPE DEFINITIONS
// ============================================================================

export type LearningProgram = typeof learningPrograms.$inferSelect;
export type NewLearningProgram = typeof learningPrograms.$inferInsert;

export type LearningPath = typeof learningPaths.$inferSelect;
export type NewLearningPath = typeof learningPaths.$inferInsert;

export type LearningModule = typeof learningModules.$inferSelect;
export type NewLearningModule = typeof learningModules.$inferInsert;

export type LearningUnit = typeof learningUnits.$inferSelect;
export type NewLearningUnit = typeof learningUnits.$inferInsert;

export type LearningLesson = typeof learningLessons.$inferSelect;
export type NewLearningLesson = typeof learningLessons.$inferInsert;

export type LearningActivity = typeof learningActivities.$inferSelect;
export type NewLearningActivity = typeof learningActivities.$inferInsert;

export type LearningAssessment = typeof learningAssessments.$inferSelect;
export type NewLearningAssessment = typeof learningAssessments.$inferInsert;

export type UserLearningProgress = typeof userLearningProgress.$inferSelect;
export type NewUserLearningProgress = typeof userLearningProgress.$inferInsert;

export type LearningCertificate = typeof learningCertificates.$inferSelect;
export type NewLearningCertificate = typeof learningCertificates.$inferInsert;

export type LearningRecommendation = typeof learningRecommendations.$inferSelect;
export type NewLearningRecommendation = typeof learningRecommendations.$inferInsert;

export type LearningAuditLog = typeof learningAuditLogs.$inferSelect;
export type NewLearningAuditLog = typeof learningAuditLogs.$inferInsert;

// ============================================================================
// LEARNING PATH HIERARCHY TYPES
// ============================================================================

export interface LearningPathHierarchy {
  program: LearningProgram;
  path: LearningPath;
  modules: LearningModuleWithUnits[];
}

export interface LearningModuleWithUnits extends LearningModule {
  units: LearningUnitWithLessons[];
}

export interface LearningUnitWithLessons extends LearningUnit {
  lessons: LearningLessonWithContent[];
}

export interface LearningLessonWithContent extends LearningLesson {
  activities: LearningActivity[];
  assessments: LearningAssessment[];
}

export interface LearningPathFull extends LearningPath {
  program: LearningProgram;
  modules: LearningModuleWithUnits[];
  progress?: UserLearningProgress[];
}

// ============================================================================
// PROGRESS METRICS TYPES
// ============================================================================

export interface ProgressMetrics {
  overallProgress: number; // 0-100
  moduleProgress: ModuleProgress[];
  lessonProgress: LessonProgress[];
  timeSpent: number; // in seconds
  lastAccessedAt: Date;
  completionStatus: 'not_started' | 'in_progress' | 'completed';
}

export interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  progress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  timeSpent: number; // in seconds
}

export interface LessonProgress {
  lessonId: string;
  lessonTitle: string;
  progress: number; // 0-100
  completionStatus: 'not_started' | 'in_progress' | 'completed';
  timeSpent: number; // in seconds
  completedAt?: Date;
}

export interface LearningVelocity {
  lessonsPerDay: number;
  averageTimePerLesson: number; // in seconds
  completionRate: number; // percentage
  streakDays: number;
}

// ============================================================================
// RECOMMENDATION TYPES
// ============================================================================

export type RecommendationType =
  | 'next_lesson'
  | 'next_module'
  | 'remedial'
  | 'practice'
  | 'certification';

export interface RecommendationData {
  targetId: string;
  targetType: 'lesson' | 'module' | 'path' | 'activity';
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedDuration?: number; // in minutes
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface RecommendationEngineConfig {
  weights: {
    progressWeight: number;
    performanceWeight: number;
    engagementWeight: number;
    goalsWeight: number;
  };
  thresholds: {
    minConfidenceScore: number;
    maxRecommendationsPerUser: number;
    recommendationExpiryDays: number;
  };
}

export interface RecommendationInputs {
  userId: string;
  placementResults?: any; // From Phase 10
  learningProgress: UserLearningProgress[];
  assessmentPerformance: any[]; // From existing quiz system
  xpHistory: any[]; // From Phase 6
  achievements: any[]; // From Phase 7
  streakActivity: any; // From Phase 7
  missionCompletion: any[]; // From Phase 9
  engagementMetrics: any;
  learningBehaviors: any;
  individualGoals: any;
}

export interface RecommendationOutputs {
  nextLesson?: RecommendationData;
  nextModule?: RecommendationData;
  recommendedPath?: RecommendationData;
  remedialContent?: RecommendationData[];
  practiceActivities?: RecommendationData[];
  dailyGoals?: RecommendationData[];
  certificationTargets?: RecommendationData[];
}

// ============================================================================
// CERTIFICATION TYPES
// ============================================================================

export type CertificateType =
  | 'program_completion'
  | 'path_completion'
  | 'skill_certificate'
  | 'achievement_certificate';

export interface CertificateTemplate {
  id: string;
  name: string;
  type: CertificateType;
  design: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    logoUrl: string;
    signatureUrl: string;
  };
  layout: {
    titlePosition: { x: number; y: number };
    recipientPosition: { x: number; y: number };
    datePosition: { x: number; y: number };
    certificateNumberPosition: { x: number; y: number };
  };
}

export interface CertificateIssuanceCriteria {
  pathId: string;
  requiredCompletionPercentage: number;
  requiredAssessmentScore: number;
  minimumTimeSpent: number; // in seconds
  requiredAchievements?: string[];
}

export interface CertificateValidationResult {
  isValid: boolean;
  certificate: LearningCertificate | null;
  revocationReason?: string;
  expirationStatus?: 'valid' | 'expired' | 'revoked';
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface LearnerAnalytics {
  userId: string;
  progressPercentage: number;
  learningVelocity: LearningVelocity;
  assessmentPerformance: {
    averageScore: number;
    totalAssessments: number;
    passedAssessments: number;
    failedAssessments: number;
  };
  completionRates: {
    lessonCompletionRate: number;
    moduleCompletionRate: number;
    pathCompletionRate: number;
  };
  retentionIndicators: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    churnRate: number;
  };
  skillDevelopment: {
    skills: string[];
    proficiencyLevels: Record<string, number>;
  };
  achievementHistory: any[];
  recommendationEffectiveness: {
    acceptanceRate: number;
    completionRate: number;
    averageTimeToComplete: number;
  };
}

export interface AdministrativeAnalytics {
  enrollmentMetrics: {
    totalEnrollments: number;
    activeEnrollments: number;
    completedEnrollments: number;
    enrollmentByProgram: Record<string, number>;
    enrollmentByPath: Record<string, number>;
  };
  completionMetrics: {
    overallCompletionRate: number;
    completionByProgram: Record<string, number>;
    completionByPath: Record<string, number>;
    averageTimeToComplete: number;
  };
  learnerDropOffAnalysis: {
    dropOffPoints: string[];
    dropOffRates: Record<string, number>;
    commonDropOffReasons: string[];
  };
  learningPathEffectiveness: {
    pathId: string;
    pathName: string;
    enrollmentCount: number;
    completionRate: number;
    averageScore: number;
    learnerSatisfaction: number;
  }[];
  curriculumPerformance: {
    moduleId: string;
    moduleName: string;
    averageCompletionRate: number;
    averageTimeSpent: number;
    averageScore: number;
  }[];
  cohortAnalysis: {
    cohortId: string;
    cohortName: string;
    enrollmentDate: Date;
    completionRate: number;
    averageTimeToComplete: number;
    retentionRate: number;
  }[];
  recommendationAccuracy: {
    totalRecommendations: number;
    acceptedRecommendations: number;
    acceptanceRate: number;
    averageConfidenceScore: number;
  };
  certificationMetrics: {
    totalCertificatesIssued: number;
    certificatesByType: Record<string, number>;
    certificatesByPath: Record<string, number>;
    averageTimeToCertify: number;
  };
}

// ============================================================================
// ASSESSMENT INTEGRATION TYPES
// ============================================================================

export interface AssessmentIntegration {
  lessonId: string;
  assessmentId: string;
  xpReward: number; // From Phase 6
  achievementUnlocks: string[]; // From Phase 7
  missionProgressUpdates: any[]; // From Phase 9
  streakMaintenance: boolean; // From Phase 7
  certificationEligibility: boolean;
}

export interface PlacementTestIntegration {
  userId: string;
  placementResults: any; // From Phase 10
  recommendedPath: string;
  recommendedStartingModule: string;
  recommendedStartingLesson: string;
}

// ============================================================================
// CONTENT MANAGEMENT TYPES
// ============================================================================

export type ContentLifecycleStatus =
  | 'draft'
  | 'review'
  | 'approval'
  | 'published'
  | 'active'
  | 'archived';

export interface ContentMetadata {
  version: number;
  status: ContentLifecycleStatus;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export interface CurriculumGovernance {
  reviewRequired: boolean;
  approvalRequired: boolean;
  versionControlEnabled: boolean;
  auditLoggingEnabled: boolean;
  qualityStandards: string[];
}

// ============================================================================
// LEARNER JOURNEY TYPES
// ============================================================================

export type LearnerJourneyStage =
  | 'registration'
  | 'placement_test'
  | 'path_recommendation'
  | 'enrollment'
  | 'module_progression'
  | 'assessments'
  | 'achievements'
  | 'certification'
  | 'next_recommendation';

export interface LearnerJourney {
  userId: string;
  currentStage: LearnerJourneyStage;
  stageHistory: {
    stage: LearnerJourneyStage;
    enteredAt: Date;
    completedAt?: Date;
    duration?: number; // in seconds
  }[];
  milestones: {
    milestone: string;
    achievedAt: Date;
    metadata?: any;
  }[];
  goals: {
    goalId: string;
    description: string;
    targetDate: Date;
    status: 'pending' | 'in_progress' | 'completed';
    progress: number;
  }[];
}

// ============================================================================
// SECURITY AND RBAC TYPES
// ============================================================================

export type LearningPathsRole = 'learner' | 'instructor' | 'admin' | 'super_admin';

export interface LearningPathsPermission {
  resource: 'program' | 'path' | 'module' | 'lesson' | 'progress' | 'certificate' | 'analytics' | 'audit';
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'approve' | 'publish';
  granted: boolean;
}

export interface RolePermissions {
  role: LearningPathsRole;
  permissions: LearningPathsPermission[];
}

export const ROLE_PERMISSIONS: Record<LearningPathsRole, LearningPathsPermission[]> = {
  learner: [
    { resource: 'program', action: 'read', granted: true },
    { resource: 'path', action: 'read', granted: true },
    { resource: 'module', action: 'read', granted: true },
    { resource: 'lesson', action: 'read', granted: true },
    { resource: 'progress', action: 'read', granted: true },
    { resource: 'progress', action: 'update', granted: true },
    { resource: 'certificate', action: 'read', granted: true },
  ],
  instructor: [
    { resource: 'program', action: 'read', granted: true },
    { resource: 'path', action: 'read', granted: true },
    { resource: 'path', action: 'update', granted: true },
    { resource: 'module', action: 'read', granted: true },
    { resource: 'module', action: 'create', granted: true },
    { resource: 'module', action: 'update', granted: true },
    { resource: 'lesson', action: 'read', granted: true },
    { resource: 'lesson', action: 'create', granted: true },
    { resource: 'lesson', action: 'update', granted: true },
    { resource: 'progress', action: 'read', granted: true },
    { resource: 'certificate', action: 'read', granted: true },
    { resource: 'analytics', action: 'read', granted: true },
  ],
  admin: [
    { resource: 'program', action: 'read', granted: true },
    { resource: 'program', action: 'create', granted: true },
    { resource: 'program', action: 'update', granted: true },
    { resource: 'program', action: 'delete', granted: true },
    { resource: 'path', action: 'read', granted: true },
    { resource: 'path', action: 'create', granted: true },
    { resource: 'path', action: 'update', granted: true },
    { resource: 'path', action: 'delete', granted: true },
    { resource: 'path', action: 'publish', granted: true },
    { resource: 'module', action: 'read', granted: true },
    { resource: 'module', action: 'create', granted: true },
    { resource: 'module', action: 'update', granted: true },
    { resource: 'module', action: 'delete', granted: true },
    { resource: 'lesson', action: 'read', granted: true },
    { resource: 'lesson', action: 'create', granted: true },
    { resource: 'lesson', action: 'update', granted: true },
    { resource: 'lesson', action: 'delete', granted: true },
    { resource: 'progress', action: 'read', granted: true },
    { resource: 'progress', action: 'manage', granted: true },
    { resource: 'certificate', action: 'read', granted: true },
    { resource: 'certificate', action: 'create', granted: true },
    { resource: 'certificate', action: 'delete', granted: true },
    { resource: 'analytics', action: 'read', granted: true },
    { resource: 'audit', action: 'read', granted: true },
  ],
  super_admin: [
    { resource: 'program', action: 'read', granted: true },
    { resource: 'program', action: 'create', granted: true },
    { resource: 'program', action: 'update', granted: true },
    { resource: 'program', action: 'delete', granted: true },
    { resource: 'path', action: 'read', granted: true },
    { resource: 'path', action: 'create', granted: true },
    { resource: 'path', action: 'update', granted: true },
    { resource: 'path', action: 'delete', granted: true },
    { resource: 'path', action: 'publish', granted: true },
    { resource: 'path', action: 'approve', granted: true },
    { resource: 'module', action: 'read', granted: true },
    { resource: 'module', action: 'create', granted: true },
    { resource: 'module', action: 'update', granted: true },
    { resource: 'module', action: 'delete', granted: true },
    { resource: 'lesson', action: 'read', granted: true },
    { resource: 'lesson', action: 'create', granted: true },
    { resource: 'lesson', action: 'update', granted: true },
    { resource: 'lesson', action: 'delete', granted: true },
    { resource: 'progress', action: 'read', granted: true },
    { resource: 'progress', action: 'manage', granted: true },
    { resource: 'certificate', action: 'read', granted: true },
    { resource: 'certificate', action: 'create', granted: true },
    { resource: 'certificate', action: 'delete', granted: true },
    { resource: 'analytics', action: 'read', granted: true },
    { resource: 'audit', action: 'read', granted: true },
    { resource: 'audit', action: 'manage', granted: true },
  ],
};
