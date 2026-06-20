import { db } from '@/db/index';
import { assessmentResponses, assessmentAttempts, placementResults } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { scoreAutomatic, calculateDomainScore, calculateOverallScore } from './algorithms';
import type { QuestionScore, DomainScore, OverallScore } from './types';
import type { Question } from '../question-bank/types';
import { QuestionBank } from '../question-bank';
import { PlacementXPIntegration } from '../integrations/xp-integration';
import { PlacementAchievementsIntegration } from '../integrations/achievements-integration';

export class ScoringEngine {
  /**
   * Score a single response
   */
  static async scoreResponse(
    responseId: string,
    question: Question
  ): Promise<number> {
    const [response] = await db
      .select()
      .from(assessmentResponses)
      .where(eq(assessmentResponses.id, responseId));

    if (!response) return 0;

    const result = scoreAutomatic(question, response.responseData);
    
    await db
      .update(assessmentResponses)
      .set({
        score: result.score.toString(),
        evaluatedAt: new Date(),
      })
      .where(eq(assessmentResponses.id, responseId));

    return result.score;
  }

  /**
   * Score all responses for an attempt
   */
  static async scoreAttempt(attemptId: string): Promise<OverallScore> {
    const responses = await db
      .select()
      .from(assessmentResponses)
      .where(eq(assessmentResponses.attemptId, attemptId));

    const questionScores: QuestionScore[] = [];
    const domainScoresMap = new Map<string, QuestionScore[]>();

    for (const response of responses) {
      const question = await QuestionBank.getById(response.questionId);
      if (!question) continue;

      let score = response.score;
      if (score === null) {
        score = (await this.scoreResponse(response.id, question)).toString();
      }

      const numericScore = typeof score === 'string' ? parseFloat(score) : (score || 0);
      const maxScore = question.metadata.points || 1;

      const qs: QuestionScore = {
        questionId: response.questionId,
        score: numericScore,
        maxScore: maxScore,
        percentage: (numericScore / maxScore) * 100,
        isCorrect: numericScore === maxScore,
        domain: question.skillDomain,
      };

      questionScores.push(qs);

      if (!domainScoresMap.has(question.skillDomain)) {
        domainScoresMap.set(question.skillDomain, []);
      }
      domainScoresMap.get(question.skillDomain)!.push(qs);
    }

    // Calculate domain scores
    const domainScores: DomainScore[] = [];
    const weights = {
      reading: 1.0,
      writing: 1.0,
      listening: 1.0,
      speaking: 1.0,
      grammar: 1.0,
      vocabulary: 1.0,
    };

    for (const [domain, scores] of domainScoresMap.entries()) {
      const ds = calculateDomainScore(scores, weights[domain as keyof typeof weights] || 1.0);
      domainScores.push(ds);
    }

    // Calculate overall score
    const overallScore = calculateOverallScore(domainScores);

    return overallScore;
  }

  /**
   * Create placement result
   */
  static async createPlacementResult(
    attemptId: string,
    userId: string,
    overallScore: OverallScore,
    recommendedLevel: string
  ): Promise<void> {
    const domainScoresMap = new Map<string, number>();
    overallScore.domainScores.forEach(ds => {
      domainScoresMap.set(ds.domain, ds.percentage);
    });

    await db.insert(placementResults).values({
      userId,
      attemptId,
      readingScore: domainScoresMap.get('reading')?.toString() || null,
      writingScore: domainScoresMap.get('writing')?.toString() || null,
      listeningScore: domainScoresMap.get('listening')?.toString() || null,
      speakingScore: domainScoresMap.get('speaking')?.toString() || null,
      grammarScore: domainScoresMap.get('grammar')?.toString() || null,
      vocabularyScore: domainScoresMap.get('vocabulary')?.toString() || null,
      overallScore: overallScore.percentage.toString(),
      recommendedLevel,
    });

    // Award XP for test completion (decoupled integration)
    if (PlacementXPIntegration.isXPSystemAvailable()) {
      await PlacementXPIntegration.awardXPForTestCompletion(
        userId,
        attemptId,
        overallScore.percentage,
        recommendedLevel
      );
    }

    // Trigger achievements for test completion (decoupled integration)
    if (PlacementAchievementsIntegration.isAchievementsSystemAvailable()) {
      await PlacementAchievementsIntegration.triggerAchievementsForTestCompletion(
        userId,
        attemptId,
        overallScore.percentage,
        recommendedLevel
      );
    }
  }

  /**
   * Get placement result for an attempt
   */
  static async getPlacementResult(attemptId: string) {
    const [result] = await db
      .select()
      .from(placementResults)
      .where(eq(placementResults.attemptId, attemptId));
    return result;
  }
}
