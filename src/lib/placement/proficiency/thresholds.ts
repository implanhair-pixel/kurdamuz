import type { ProficiencyThreshold, ProficiencyLevel } from './types';

/**
 * Default proficiency thresholds (configurable through admin panel)
 */
export const defaultThresholds: ProficiencyThreshold[] = [
  {
    level: 'beginner',
    minScore: 0,
    maxScore: 39,
    description: 'New learners with basic language skills',
  },
  {
    level: 'intermediate',
    minScore: 40,
    maxScore: 69,
    description: 'Independent learners with functional language skills',
  },
  {
    level: 'advanced',
    minScore: 70,
    maxScore: 100,
    description: 'Proficient learners with advanced language skills',
  },
];

/**
 * Get proficiency level from score
 */
export function getProficiencyLevel(score: number, thresholds: ProficiencyThreshold[]): ProficiencyLevel {
  for (const threshold of thresholds) {
    if (score >= threshold.minScore && score <= threshold.maxScore) {
      return threshold.level;
    }
  }
  
  // Default to beginner if no match
  return 'beginner';
}

/**
 * Get domain proficiency level
 */
export function getDomainProficiency(
  domainScore: number,
  thresholds: ProficiencyThreshold[]
): { level: ProficiencyLevel; strength: 'strong' | 'moderate' | 'weak' } {
  const level = getProficiencyLevel(domainScore, thresholds);
  
  let strength: 'strong' | 'moderate' | 'weak';
  if (domainScore >= 80) {
    strength = 'strong';
  } else if (domainScore >= 50) {
    strength = 'moderate';
  } else {
    strength = 'weak';
  }
  
  return { level, strength };
}
