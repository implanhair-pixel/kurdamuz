// Proficiency classification type definitions

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface ProficiencyThreshold {
  level: ProficiencyLevel;
  minScore: number;
  maxScore: number;
  description: string;
}

export interface PlacementResult {
  overallScore: number;
  recommendedLevel: ProficiencyLevel;
  confidence: number;
  domainScores: DomainProficiency[];
}

export interface DomainProficiency {
  domain: string;
  score: number;
  level: ProficiencyLevel;
  strength: 'strong' | 'moderate' | 'weak';
}
