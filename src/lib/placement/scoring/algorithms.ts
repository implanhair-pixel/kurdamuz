import type { ScoringResult, QuestionScore, DomainScore, OverallScore } from './types';
import type { Question, QuestionType } from '../question-bank/types';

/**
 * Automatic scoring for objective questions
 */
export function scoreAutomatic(
  question: Question,
  userResponse: any
): ScoringResult {
  const maxScore = question.metadata.points || 1;
  let isCorrect = false;
  let score = 0;

  switch (question.questionType) {
    case 'multiple_choice':
      isCorrect = userResponse === question.correctAnswer.answer;
      score = isCorrect ? maxScore : 0;
      break;

    case 'true_false':
      isCorrect = userResponse === question.correctAnswer.answer;
      score = isCorrect ? maxScore : 0;
      break;

    case 'fill_blank':
      // Fuzzy matching for fill-in-the-blank
      isCorrect = fuzzyMatch(userResponse, question.correctAnswer.answer as string);
      score = isCorrect ? maxScore : 0;
      break;

    case 'audio_listening':
      isCorrect = userResponse === question.correctAnswer.answer;
      score = isCorrect ? maxScore : 0;
      break;

    case 'speaking':
      // Speaking requires manual evaluation or speech-to-text comparison
      // For now, return partial score based on response presence
      isCorrect = userResponse && userResponse.length > 0;
      score = isCorrect ? maxScore * 0.5 : 0; // 50% for attempting
      break;

    default:
      score = 0;
  }

  return {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
    isCorrect,
  };
}

/**
 * Fuzzy string matching for fill-in-the-blank questions
 */
function fuzzyMatch(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer || !correctAnswer) return false;
  
  const normalizedUser = userAnswer.trim().toLowerCase();
  const normalizedCorrect = correctAnswer.trim().toLowerCase();
  
  // Exact match
  if (normalizedUser === normalizedCorrect) return true;
  
  // Contains match (for longer answers)
  if (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser)) {
    return true;
  }
  
  // Levenshtein distance for close matches
  const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
  const threshold = Math.max(normalizedUser.length, normalizedCorrect.length) * 0.3;
  
  return distance <= threshold;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],
          dp[i][j - 1],
          dp[i - 1][j - 1]
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate domain score from question scores
 */
export function calculateDomainScore(
  questionScores: QuestionScore[],
  weight: number = 1.0
): DomainScore {
  if (questionScores.length === 0) {
    return {
      domain: 'unknown',
      score: 0,
      maxScore: 0,
      percentage: 0,
      weight,
      weightedScore: 0,
    };
  }

  const totalScore = questionScores.reduce((sum, qs) => sum + qs.score, 0);
  const maxScore = questionScores.reduce((sum, qs) => sum + qs.maxScore, 0);
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const weightedScore = percentage * weight;

  return {
    domain: questionScores[0].domain || 'unknown',
    score: totalScore,
    maxScore,
    percentage,
    weight,
    weightedScore,
  };
}

/**
 * Calculate overall score from domain scores
 */
export function calculateOverallScore(domainScores: DomainScore[]): OverallScore {
  if (domainScores.length === 0) {
    return {
      totalScore: 0,
      maxScore: 0,
      percentage: 0,
      domainScores: [],
    };
  }

  const totalScore = domainScores.reduce((sum, ds) => sum + ds.score, 0);
  const maxScore = domainScores.reduce((sum, ds) => sum + ds.maxScore, 0);
  const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  return {
    totalScore,
    maxScore,
    percentage,
    domainScores,
  };
}
