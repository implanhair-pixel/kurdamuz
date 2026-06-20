// Assessment type definitions

export type AssessmentType = 'placement' | 'diagnostic' | 'proficiency';

export type AssessmentStatus = 'active' | 'archived' | 'draft';

export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned' | 'expired';

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Assessment {
  id: string;
  name: string;
  description: string | null;
  assessmentType: AssessmentType;
  status: AssessmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssessmentSection {
  id: string;
  testId: string;
  skillDomain: string;
  weight: number;
  timeLimit: number | null;
  questionCount: number;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  testId: string;
  startedAt: Date;
  completedAt: Date | null;
  status: AttemptStatus;
  overallScore: number | null;
  placementLevel: ProficiencyLevel | null;
}

export interface AssessmentResponse {
  id: string;
  attemptId: string;
  questionId: string;
  responseData: any;
  score: number | null;
  evaluatedAt: Date | null;
}

export interface PlacementResult {
  id: string;
  userId: string;
  attemptId: string;
  readingScore: number | null;
  writingScore: number | null;
  listeningScore: number | null;
  speakingScore: number | null;
  grammarScore: number | null;
  vocabularyScore: number | null;
  overallScore: number;
  recommendedLevel: ProficiencyLevel;
  createdAt: Date;
}

export interface CreateAssessmentInput {
  name: string;
  description?: string;
  assessmentType: AssessmentType;
  status?: AssessmentStatus;
}

export interface StartAttemptInput {
  userId: string;
  testId: string;
}

export interface SubmitResponseInput {
  attemptId: string;
  questionId: string;
  responseData: any;
}
