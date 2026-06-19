import type { MissionDefinition } from './mission-engine';

export class ProgressTracker {
  /**
   * Check if a mission is completed based on progress value and criteria
   */
  async checkCompletion(mission: MissionDefinition, progressValue: number): Promise<boolean> {
    const criteria = mission.criteria || {};
    const targetType = criteria.target_type || 'count';
    const targetValue = criteria.target_value || 1;

    switch (mission.missionType) {
      case 'daily_login':
        // Daily login missions are completed on first login
        return progressValue >= 1;

      case 'lesson_completion':
        // Lesson completion missions require completing target number of lessons
        return progressValue >= targetValue;

      case 'quiz_completion':
        // Quiz completion missions require completing target number of quizzes with passing score
        if (targetType === 'count') {
          return progressValue >= targetValue;
        }
        return progressValue >= targetValue;

      case 'vocabulary':
        // Vocabulary missions require completing target number of vocabulary sessions
        return progressValue >= targetValue;

      case 'streak':
        // Streak missions require maintaining a streak for target number of days
        return progressValue >= targetValue;

      default:
        return progressValue >= targetValue;
    }
  }

  /**
   * Calculate progress percentage for a mission
   */
  calculateProgressPercentage(mission: MissionDefinition, progressValue: number): number {
    const criteria = mission.criteria || {};
    const targetValue = criteria.target_value || 1;

    if (targetValue <= 0) {
      return 100;
    }

    const percentage = (progressValue / targetValue) * 100;
    return Math.min(percentage, 100);
  }

  /**
   * Validate progress update
   */
  validateProgressUpdate(
    mission: MissionDefinition,
    currentProgress: number,
    newProgress: number
  ): boolean {
    // Progress should not decrease
    if (newProgress < currentProgress) {
      return false;
    }

    // Progress should not exceed reasonable limits
    const criteria = mission.criteria || {};
    const targetValue = criteria.target_value || 1;
    const maxValue = targetValue * 10; // Allow up to 10x the target value

    if (newProgress > maxValue) {
      return false;
    }

    return true;
  }
}

export const progressTracker = new ProgressTracker();
