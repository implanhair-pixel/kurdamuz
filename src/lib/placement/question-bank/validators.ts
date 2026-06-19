import { z } from 'zod';

export const questionTypeSchema = z.enum(['multiple_choice', 'true_false', 'fill_blank', 'audio_listening', 'speaking']);

export const skillDomainSchema = z.enum(['reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary']);

export const difficultyLevelSchema = z.enum(['beginner', 'intermediate', 'advanced']);

export const questionStatusSchema = z.enum(['active', 'archived', 'draft']);

export const questionContentSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).optional(),
  audioUrl: z.string().url().optional(),
  prompt: z.string().optional(),
  expectedPhrases: z.array(z.string()).optional(),
  persianTranslation: z.string().optional(),
});

export const correctAnswerSchema = z.object({
  answer: z.union([z.string(), z.boolean()]),
  expectedPhrases: z.array(z.string()).optional(),
});

export const questionMetadataSchema = z.object({
  points: z.number().int().positive(),
  timeLimit: z.number().int().positive().optional(),
});

export const createQuestionSchema = z.object({
  questionType: questionTypeSchema,
  skillDomain: skillDomainSchema,
  difficultyLevel: difficultyLevelSchema,
  content: questionContentSchema,
  correctAnswer: correctAnswerSchema,
  metadata: questionMetadataSchema.optional(),
  status: questionStatusSchema.optional(),
});

export const updateQuestionSchema = z.object({
  content: questionContentSchema.optional(),
  correctAnswer: correctAnswerSchema.optional(),
  metadata: questionMetadataSchema.optional(),
  status: questionStatusSchema.optional(),
});
