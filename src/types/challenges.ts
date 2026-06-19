// src/types/challenges.ts

export enum ChallengeType {
  QUIZ = 'quiz',
  VOCABULARY = 'vocabulary',
  TRANSLATION = 'translation',
  LISTENING = 'listening',
  READING = 'reading',
  WRITING = 'writing',
  GRAMMAR = 'grammar',
  TIMED = 'timed',
  STREAK = 'streak',
  XP = 'xp',
  TEACHER_CREATED = 'teacher_created',
  EVENT = 'event',
  SEASONAL = 'seasonal',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum ChallengeStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum ScheduleStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

export enum PublicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum SubmissionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
}

export enum ReviewStatus {
  AUTOMATIC = 'automatic',
  TEACHER_REVIEW = 'teacher_review',
  ADMIN_REVIEW = 'admin_review',
  HYBRID = 'hybrid',
}

export enum RewardType {
  XP = 'xp',
  BADGE = 'badge',
  ACHIEVEMENT = 'achievement',
  CERTIFICATE = 'certificate',
  TITLE = 'title',
  DECORATION = 'decoration',
  CONTENT = 'content',
  COURSE_ACCESS = 'course_access',
}

export enum LeaderboardType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CHALLENGE = 'challenge',
  COURSE = 'course',
  GLOBAL = 'global',
  CLASSROOM = 'classroom',
  SEASONAL = 'seasonal',
}

export enum LeaderboardScope {
  GLOBAL = 'global',
  CLASSROOM = 'classroom',
  COURSE = 'course',
}

// Challenge Definition Interface
export interface ChallengeDefinition {
  id: string;
  title: string;
  description?: string;
  challengeType: ChallengeType;
  difficultyLevel: DifficultyLevel;
  contentConfig: Record<string, any>;
  scoringRules: ScoringRules;
  timeLimit?: number;
  maxAttempts?: number;
  xpReward: number;
  badgeReward?: string;
  isPublic: boolean;
  createdBy: string;
  status: ChallengeStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Scoring Rules Interface
export interface ScoringRules {
  basePoints: number;
  timeBonusEnabled: boolean;
  timeBonusDecay: number; // Points lost per second
  difficultyMultiplier: Record<DifficultyLevel, number>;
  streakBonusEnabled: boolean;
  streakBonusPerDay: number;
  achievementBonusEnabled: boolean;
  maxScore: number;
}

// Challenge Schedule Interface
export interface ChallengeSchedule {
  id: string;
  challengeDefinitionId: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  scheduledTime: Date;
  endDate?: Date;
  timezone: string;
  status: ScheduleStatus;
  publicationStatus: PublicationStatus;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Challenge Submission Interface
export interface ChallengeSubmission {
  id: string;
  scheduleId: string;
  userId: string;
  submissionData: Record<string, any>;
  submittedAt: Date;
  timeTaken?: number;
  status: SubmissionStatus;
  reviewStatus: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  fraudScore: number;
  isDuplicate: boolean;
  duplicateOf?: string;
}

// Challenge Score Interface
export interface ChallengeScore {
  id: string;
  submissionId: string;
  userId: string;
  scheduleId: string;
  baseScore: number;
  timeBonus: number;
  difficultyMultiplier: number;
  streakBonus: number;
  achievementBonus: number;
  finalScore: number;
  rank?: number;
  percentile?: number;
  calculatedAt: Date;
}

// Challenge Reward Interface
export interface ChallengeReward {
  id: string;
  scoreId: string;
  userId: string;
  rewardType: RewardType;
  rewardValue: Record<string, any>;
  awardedAt: Date;
  isClaimed: boolean;
  claimedAt?: Date;
}

// Leaderboard Entry Interface
export interface LeaderboardEntry {
  id: string;
  scheduleId: string;
  userId: string;
  leaderboardType: LeaderboardType;
  scope: LeaderboardScope;
  scopeId?: string;
  score: number;
  rank: number;
  previousRank?: number;
  change?: number;
  updatedAt: Date;
}

// Audit Log Interface
export interface ChallengeAuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// API Request/Response Types
export interface CreateChallengeDefinitionRequest {
  title: string;
  description?: string;
  challengeType: ChallengeType;
  difficultyLevel: DifficultyLevel;
  contentConfig: Record<string, any>;
  scoringRules: ScoringRules;
  timeLimit?: number;
  maxAttempts?: number;
  xpReward: number;
  badgeReward?: string;
  isPublic?: boolean;
}

export interface SubmitChallengeRequest {
  scheduleId: string;
  submissionData: Record<string, any>;
  timeTaken?: number;
}

export interface ReviewSubmissionRequest {
  submissionId: string;
  action: 'approve' | 'reject' | 'flag';
  reviewNotes?: string;
}

export interface GetLeaderboardRequest {
  scheduleId?: string;
  leaderboardType: LeaderboardType;
  scope?: LeaderboardScope;
  scopeId?: string;
  limit?: number;
  offset?: number;
}

export interface CreateChallengeScheduleRequest {
  challengeDefinitionId: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  scheduledTime: Date;
  endDate?: Date;
  timezone?: string;
}
