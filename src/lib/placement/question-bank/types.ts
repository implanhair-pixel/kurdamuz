// Question type definitions for placement test

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_blank' | 'audio_listening' | 'speaking';

export type SkillDomain = 'reading' | 'writing' | 'listening' | 'speaking' | 'grammar' | 'vocabulary';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type QuestionStatus = 'active' | 'archived' | 'draft';

export interface QuestionContent {
  question: string;
  options?: string[];
  audioUrl?: string;
  prompt?: string;
  expectedPhrases?: string[];
  persianTranslation?: string;
}

export interface CorrectAnswer {
  answer: string | boolean;
  expectedPhrases?: string[];
}

export interface QuestionMetadata {
  points: number;
  timeLimit?: number; // in seconds
  [key: string]: any;
}

export interface Question {
  id: string;
  questionType: QuestionType;
  skillDomain: SkillDomain;
  difficultyLevel: DifficultyLevel;
  content: QuestionContent;
  correctAnswer: CorrectAnswer;
  metadata: QuestionMetadata;
  status: QuestionStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuestionInput {
  questionType: QuestionType;
  skillDomain: SkillDomain;
  difficultyLevel: DifficultyLevel;
  content: QuestionContent;
  correctAnswer: CorrectAnswer;
  metadata?: QuestionMetadata;
  status?: QuestionStatus;
}

export interface UpdateQuestionInput {
  content?: QuestionContent;
  correctAnswer?: CorrectAnswer;
  metadata?: QuestionMetadata;
  status?: QuestionStatus;
}

export interface QuestionFilter {
  skillDomain?: SkillDomain;
  difficultyLevel?: DifficultyLevel;
  questionType?: QuestionType;
  status?: QuestionStatus;
}
