// Scoring type definitions

export type ScoringMethod = 'automatic' | 'manual' | 'rubric_based' | 'hybrid';

export interface ScoringResult {
  score: number;
  maxScore: number;
  percentage: number;
  isCorrect: boolean;
  feedback?: string;
}

export interface QuestionScore {
  questionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  isCorrect: boolean;
  domain?: string;
}

export interface DomainScore {
  domain: string;
  score: number;
  maxScore: number;
  percentage: number;
  weight: number;
  weightedScore: number;
}

export interface OverallScore {
  totalScore: number;
  maxScore: number;
  percentage: number;
  domainScores: DomainScore[];
}

export interface ScoringConfig {
  method: ScoringMethod;
  rubric?: any;
  weights?: Record<string, number>;
}
