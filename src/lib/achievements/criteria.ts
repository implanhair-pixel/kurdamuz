import type { AchievementCriteria, AchievementEvaluationContext } from '@/types/achievement';

/**
 * Evaluate achievement criteria against context
 */
export async function evaluateCriteria(
  criteria: AchievementCriteria,
  context: AchievementEvaluationContext
): Promise<boolean> {
  switch (criteria.type) {
    case 'count':
      return await evaluateCountCriteria(criteria, context);
    
    case 'streak':
      return await evaluateStreakCriteria(criteria, context);
    
    case 'cumulative':
      return await evaluateCumulativeCriteria(criteria, context);
    
    case 'conditional':
      return await evaluateConditionalCriteria(criteria, context);
    
    case 'composite':
      return await evaluateCompositeCriteria(criteria, context);
    
    default:
      return false;
  }
}

/**
 * Evaluate count-based criteria
 */
async function evaluateCountCriteria(
  criteria: AchievementCriteria,
  context: AchievementEvaluationContext
): Promise<boolean> {
  const eventType = criteria.conditions?.eventType || context.eventType;
  
  if (eventType !== context.eventType) {
    return false;
  }

  // Check timeframe if specified
  if (criteria.timeframe) {
    const now = new Date();
    if (now < criteria.timeframe.start || now > criteria.timeframe.end) {
      return false;
    }
  }

  // Count would be calculated from event history
  // For now, check if event data includes count
  const count = context.eventData.count || 0;
  return count >= criteria.target;
}

/**
 * Evaluate streak-based criteria
 */
async function evaluateStreakCriteria(
  criteria: AchievementCriteria,
  context: AchievementEvaluationContext
): Promise<boolean> {
  const { getOrCreateUserStreak } = await import('../streaks');
  const streak = await getOrCreateUserStreak(context.userId);
  
  return streak.currentStreak >= criteria.target;
}

/**
 * Evaluate cumulative criteria
 */
async function evaluateCumulativeCriteria(
  criteria: AchievementCriteria,
  context: AchievementEvaluationContext
): Promise<boolean> {
  const eventTypes = criteria.conditions?.eventTypes || [context.eventType];
  
  if (!eventTypes.includes(context.eventType)) {
    return false;
  }

  // Check timeframe if specified
  if (criteria.timeframe) {
    const now = new Date();
    if (now < criteria.timeframe.start || now > criteria.timeframe.end) {
      return false;
    }
  }

  // Cumulative progress would be calculated from event history
  // For now, check if event data includes cumulative value
  const cumulative = context.eventData.cumulative || 0;
  return cumulative >= criteria.target;
}

/**
 * Evaluate conditional criteria
 */
async function evaluateConditionalCriteria(
  criteria: AchievementCriteria,
  context: AchievementEvaluationContext
): Promise<boolean> {
  if (!criteria.conditions) {
    return false;
  }

  // Check all conditions
  for (const condition of Object.entries(criteria.conditions)) {
    const [field, expectedValue] = condition;
    const actualValue = getNestedValue(context.eventData, field);
    
    if (actualValue !== expectedValue) {
      return false;
    }
  }

  return true;
}

/**
 * Evaluate composite criteria (AND/OR logic)
 */
async function evaluateCompositeCriteria(
  criteria: AchievementCriteria,
  context: AchievementEvaluationContext
): Promise<boolean> {
  if (!criteria.dependencies || criteria.dependencies.length === 0) {
    return false;
  }

  const operator = criteria.conditions?.operator || 'AND';
  const results = await Promise.all(
    criteria.dependencies.map(dep => evaluateCriteria(dep as unknown as AchievementCriteria, context))
  );

  if (operator === 'AND') {
    return results.every(r => r);
  } else if (operator === 'OR') {
    return results.some(r => r);
  }

  return false;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Calculate progress percentage for an achievement
 */
export function calculateProgress(
  current: number,
  target: number
): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

/**
 * Estimate completion date based on current progress rate
 */
export function estimateCompletionDate(
  current: number,
  target: number,
  startDate: Date,
  progressRate: number // units per day
): Date | null {
  if (current >= target) return null;
  if (progressRate <= 0) return null;

  const remaining = target - current;
  const daysRemaining = remaining / progressRate;
  
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + Math.ceil(daysRemaining));
  
  return completionDate;
}

/**
 * Validate achievement criteria structure
 */
export function validateCriteria(criteria: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!criteria.type) {
    errors.push('Criteria type is required');
  }

  if (!criteria.target || typeof criteria.target !== 'number') {
    errors.push('Target is required and must be a number');
  }

  if (criteria.target < 0) {
    errors.push('Target cannot be negative');
  }

  const validTypes = ['count', 'streak', 'cumulative', 'conditional', 'composite'];
  if (criteria.type && !validTypes.includes(criteria.type)) {
    errors.push(`Invalid criteria type: ${criteria.type}`);
  }

  if (criteria.type === 'composite' && !criteria.dependencies) {
    errors.push('Composite criteria requires dependencies');
  }

  if (criteria.timeframe) {
    if (!criteria.timeframe.start || !criteria.timeframe.end) {
      errors.push('Timeframe requires both start and end dates');
    }
    if (new Date(criteria.timeframe.start) > new Date(criteria.timeframe.end)) {
      errors.push('Timeframe start must be before end');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get criteria description for display
 */
export function getCriteriaDescription(criteria: AchievementCriteria): string {
  switch (criteria.type) {
    case 'count':
      return `Complete ${criteria.target} ${criteria.conditions?.eventType || 'activities'}`;
    
    case 'streak':
      return `Maintain a ${criteria.target}-day streak`;
    
    case 'cumulative':
      return `Accumulate ${criteria.target} ${criteria.conditions?.eventTypes?.join(' or ') || 'points'}`;
    
    case 'conditional':
      return `Meet specific conditions`;
    
    case 'composite':
      return `Complete multiple requirements`;
    
    default:
      return 'Complete achievement requirements';
  }
}

/**
 * Check if criteria are time-limited
 */
export function isTimeLimited(criteria: AchievementCriteria): boolean {
  return !!(criteria.timeframe && criteria.timeframe.start && criteria.timeframe.end);
}

/**
 * Check if time-limited criteria are still active
 */
export function isCriteriaActive(criteria: AchievementCriteria): boolean {
  if (!isTimeLimited(criteria)) {
    return true;
  }

  const now = new Date();
  const start = new Date(criteria.timeframe!.start);
  const end = new Date(criteria.timeframe!.end);

  return now >= start && now <= end;
}

/**
 * Get remaining time for time-limited criteria
 */
export function getRemainingTime(criteria: AchievementCriteria): number | null {
  if (!isTimeLimited(criteria)) {
    return null;
  }

  const now = new Date();
  const end = new Date(criteria.timeframe!.end);
  const remaining = end.getTime() - now.getTime();

  return Math.max(0, remaining);
}
