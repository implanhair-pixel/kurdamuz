// Engagement metrics types
export interface EngagementMetrics {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalLearningDays: number;
  averageSessionDuration: number;
  totalSessions: number;
  completionRate: number;
  retentionScore: number;
  engagementScore: number;
  lastActiveDate: Date;
  weeklyActivity: WeeklyActivity;
  monthlyActivity: MonthlyActivity;
}

// Weekly activity breakdown
export interface WeeklyActivity {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

// Monthly activity breakdown
export interface MonthlyActivity {
  week1: number;
  week2: number;
  week3: number;
  week4: number;
}

// Learner analytics data
export interface LearnerAnalytics {
  userId: string;
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  metrics: EngagementMetrics;
  achievementProgress: AchievementProgressSummary;
  learningConsistency: LearningConsistencyMetrics;
  engagementTrends: EngagementTrend[];
}

// Analytics period
export type AnalyticsPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Achievement progress summary
export interface AchievementProgressSummary {
  totalAchievements: number;
  earnedAchievements: number;
  inProgressAchievements: number;
  completionRate: number;
  recentEarned: RecentAchievement[];
  upcomingMilestones: UpcomingMilestone[];
}

// Recent achievement
export interface RecentAchievement {
  achievementId: string;
  name: string;
  earnedAt: Date;
  xpAwarded: number;
}

// Upcoming milestone
export interface UpcomingMilestone {
  achievementId: string;
  name: string;
  currentProgress: number;
  targetProgress: number;
  estimatedCompletion: Date;
}

// Learning consistency metrics
export interface LearningConsistencyMetrics {
  averageDaysPerWeek: number;
  longestConsistentPeriod: number;
  consistencyScore: number;
  preferredLearningTimes: PreferredTime[];
  learningPatterns: LearningPattern[];
}

// Preferred learning time
export interface PreferredTime {
  hour: number;
  dayOfWeek: number;
  sessionCount: number;
}

// Learning pattern
export interface LearningPattern {
  patternType: string;
  frequency: number;
  description: string;
}

// Engagement trend
export interface EngagementTrend {
  date: Date;
  engagementScore: number;
  sessionsCompleted: number;
  timeSpentMinutes: number;
  achievementsEarned: number;
}

// Administrative analytics
export interface AdministrativeAnalytics {
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  streakRetention: StreakRetentionMetrics;
  achievementDistribution: AchievementDistributionMetrics;
  engagementFunnel: EngagementFunnelMetrics;
  learnerRetention: LearnerRetentionMetrics;
  cohortAnalysis: CohortAnalysis[];
  behavioralSegments: BehavioralSegment[];
}

// Streak retention metrics
export interface StreakRetentionMetrics {
  totalActiveStreaks: number;
  averageStreakLength: number;
  streakRetentionRate: number;
  recoveryUsageRate: number;
  streakBreakdownByLength: StreakLengthDistribution[];
}

// Streak length distribution
export interface StreakLengthDistribution {
  range: string;
  count: number;
  percentage: number;
}

// Achievement distribution metrics
export interface AchievementDistributionMetrics {
  totalAchievementsEarned: number;
  achievementsByCategory: Record<string, number>;
  mostPopularAchievements: PopularAchievement[];
  achievementCompletionRate: number;
  averageTimeToComplete: number;
}

// Popular achievement
export interface PopularAchievement {
  achievementId: string;
  name: string;
  earnedCount: number;
  percentage: number;
}

// Engagement funnel metrics
export interface EngagementFunnelMetrics {
  totalUsers: number;
  activeUsers: number;
  streakUsers: number;
  achievementUsers: number;
  conversionRates: ConversionRate[];
}

// Conversion rate
export interface ConversionRate {
  stage: string;
  count: number;
  rate: number;
}

// Learner retention metrics
export interface LearnerRetentionMetrics {
  day1Retention: number;
  day7Retention: number;
  day30Retention: number;
  day90Retention: number;
  averageSessionCount: number;
  churnRate: number;
}

// Cohort analysis
export interface CohortAnalysis {
  cohortId: string;
  startDate: Date;
  initialUsers: number;
  retainedUsers: number;
  retentionRate: number;
  averageEngagement: number;
}

// Behavioral segment
export interface BehavioralSegment {
  segmentId: string;
  segmentName: string;
  userCount: number;
  characteristics: string[];
  averageMetrics: EngagementMetrics;
}

// Report generation request
export interface ReportGenerationRequest {
  reportType: ReportType;
  period: AnalyticsPeriod;
  startDate: Date;
  endDate: Date;
  filters?: ReportFilters;
  format: ReportFormat;
}

// Report type
export type ReportType = 
  | 'streak_analytics'
  | 'achievement_analytics'
  | 'engagement_analytics'
  | 'retention_analytics'
  | 'cohort_analysis'
  | 'behavioral_segmentation';

// Report filters
export interface ReportFilters {
  userId?: string;
  userSegment?: string;
  achievementCategory?: string;
  streakRange?: [number, number];
  dateRange?: [Date, Date];
}

// Report format
export type ReportFormat = 'json' | 'csv' | 'pdf';

// Generated report
export interface GeneratedReport {
  reportId: string;
  reportType: ReportType;
  period: AnalyticsPeriod;
  generatedAt: Date;
  data: any;
  metadata: ReportMetadata;
}

// Report metadata
export interface ReportMetadata {
  totalRecords: number;
  generationTime: number;
  filtersApplied: ReportFilters;
  dataQuality: DataQualityMetrics;
}

// Data quality metrics
export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
}
