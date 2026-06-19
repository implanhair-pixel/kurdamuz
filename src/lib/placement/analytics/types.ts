// Analytics type definitions

export interface AssessmentAnalytics {
  totalAttempts: number;
  completionRate: number;
  averageScore: number;
  averageTime: number;
  scoreDistribution: ScoreDistribution;
  placementDistribution: PlacementDistribution;
}

export interface ScoreDistribution {
  beginner: number;
  intermediate: number;
  advanced: number;
}

export interface PlacementDistribution {
  beginner: number;
  intermediate: number;
  advanced: number;
}

export interface SkillBreakdown {
  domain: string;
  averageScore: number;
  improvementTrend: number;
  rank: number;
}

export interface PerformanceMetrics {
  accuracy: number;
  speed: number;
  consistency: number;
  growth: number;
}
