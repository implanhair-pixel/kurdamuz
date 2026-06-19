import { z } from 'zod';
import type { MissionDefinition } from './mission-engine';

// Mission type enum
export const MissionTypeSchema = z.enum([
  'daily_login',
  'lesson_completion',
  'quiz_completion',
  'vocabulary',
  'streak',
]);

// Difficulty enum
export const DifficultySchema = z.enum(['easy', 'medium', 'hard']);

// Mission criteria schema
export const MissionCriteriaSchema = z.object({
  target_type: z.enum(['count', 'score', 'days', 'sessions']).optional(),
  target_value: z.number().int().positive().optional(),
  time_limit: z.number().int().positive().optional(),
  min_score: z.number().int().optional(),
  max_attempts: z.number().int().positive().optional(),
});

// Mission definition schema
export const MissionDefinitionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  missionType: MissionTypeSchema,
  difficulty: DifficultySchema,
  criteria: MissionCriteriaSchema.optional(),
  xpReward: z.number().int().nonnegative(),
  coinReward: z.number().int().nonnegative(),
  active: z.boolean().default(true),
});

export class CriteriaValidator {
  /**
   * Validate mission definition
   */
  validateMissionDefinition(data: any): MissionDefinition {
    const validated = MissionDefinitionSchema.parse(data);
    return validated as MissionDefinition;
  }

  /**
   * Validate mission criteria for specific mission type
   */
  validateCriteriaForMissionType(missionType: string, criteria: any): boolean {
    switch (missionType) {
      case 'daily_login':
        // Daily login doesn't require specific criteria
        return true;

      case 'lesson_completion':
        // Lesson completion requires target count
        return criteria.target_type === 'count' && criteria.target_value > 0;

      case 'quiz_completion':
        // Quiz completion requires target count and optionally min score
        if (criteria.target_type !== 'count' || criteria.target_value <= 0) {
          return false;
        }
        if (criteria.min_score !== undefined && (criteria.min_score < 0 || criteria.min_score > 100)) {
          return false;
        }
        return true;

      case 'vocabulary':
        // Vocabulary requires target count
        return criteria.target_type === 'sessions' && criteria.target_value > 0;

      case 'streak':
        // Streak requires target days
        return criteria.target_type === 'days' && criteria.target_value > 0;

      default:
        return false;
    }
  }

  /**
   * Validate reward values
   */
  validateRewards(xpReward: number, coinReward: number): boolean {
    if (xpReward < 0 || coinReward < 0) {
      return false;
    }

    // Reasonable upper limits
    if (xpReward > 10000 || coinReward > 10000) {
      return false;
    }

    return true;
  }

  /**
   * Validate mission difficulty
   */
  validateDifficulty(difficulty: string): boolean {
    return DifficultySchema.safeParse(difficulty).success;
  }
}

export const criteriaValidator = new CriteriaValidator();
