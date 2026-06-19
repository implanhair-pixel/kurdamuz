// src/lib/challenges/scoring.ts
import { db } from '@/db';
import { challengeScores, challengeSubmissions, challengeSchedules, challengeDefinitions, userStreaks, challengeLeaderboards } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { DifficultyLevel } from '@/types/challenges';

interface ScoringInput {
  submissionData: Record<string, any>;
  correctAnswers?: Record<string, any>;
  timeTaken?: number;
  timeLimit?: number;
  difficultyLevel?: DifficultyLevel;
  userId: string;
  scheduleId: string;
  submissionId: string;
}

interface ScoringResult {
  baseScore: number;
  timeBonus: number;
  difficultyMultiplier: number;
  streakBonus: number;
  achievementBonus: number;
  finalScore: number;
}

const DIFFICULTY_MULTIPLIERS: Record<DifficultyLevel, number> = {
  beginner: 1.0,
  intermediate: 1.5,
  advanced: 2.0,
  expert: 2.5,
};

export async function calculateScore(input: ScoringInput): Promise<ScoringResult> {
  const baseScore = calculateBaseScore(input.submissionData, input.correctAnswers);
  const timeBonus = calculateTimeBonus(input.timeTaken, input.timeLimit, baseScore);
  const difficultyMultiplier = input.difficultyLevel
    ? DIFFICULTY_MULTIPLIERS[input.difficultyLevel]
    : 1.0;
  const streakBonus = await calculateStreakBonus(input.userId);
  const achievementBonus = 0;

  const finalScore = Math.round(
    (baseScore + timeBonus + streakBonus + achievementBonus) * difficultyMultiplier
  );

  return {
    baseScore,
    timeBonus,
    difficultyMultiplier,
    streakBonus,
    achievementBonus,
    finalScore,
  };
}

function calculateBaseScore(
  submissionData: Record<string, any>,
  correctAnswers?: Record<string, any>
): number {
  if (!correctAnswers) {
    return 100;
  }

  let correct = 0;
  let total = 0;

  for (const key of Object.keys(correctAnswers)) {
    total++;
    if (submissionData[key] === correctAnswers[key]) {
      correct++;
    }
  }

  return total > 0 ? Math.round((correct / total) * 100) : 0;
}

function calculateTimeBonus(
  timeTaken?: number,
  timeLimit?: number,
  baseScore?: number
): number {
  if (!timeTaken || !timeLimit || !baseScore) return 0;

  const timeRatio = 1 - timeTaken / timeLimit;
  if (timeRatio <= 0) return 0;

  return Math.round(baseScore * timeRatio * 0.2);
}

async function calculateStreakBonus(userId: string): Promise<number> {
  try {
    const [streak] = await db
      .select()
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);

    if (!streak) return 0;

    const currentStreak = streak.currentStreak || 0;

    if (currentStreak >= 30) return 20;
    if (currentStreak >= 14) return 15;
    if (currentStreak >= 7) return 10;
    if (currentStreak >= 3) return 5;

    return 0;
  } catch (error) {
    console.error('Error calculating streak bonus:', error);
    return 0;
  }
}

export async function saveScore(
  submissionId: string,
  userId: string,
  scheduleId: string,
  scoringResult: ScoringResult
): Promise<void> {
  try {
    await db.insert(challengeScores).values({
      submissionId,
      userId,
      scheduleId,
      baseScore: scoringResult.baseScore,
      timeBonus: scoringResult.timeBonus,
      difficultyMultiplier: scoringResult.difficultyMultiplier.toString() as any,
      streakBonus: scoringResult.streakBonus,
      achievementBonus: scoringResult.achievementBonus,
      finalScore: scoringResult.finalScore,
    });

    await updateLeaderboard(scheduleId, userId, scoringResult.finalScore);
  } catch (error) {
    console.error('Error saving score:', error);
    throw error;
  }
}

async function updateLeaderboard(
  scheduleId: string,
  userId: string,
  score: number
): Promise<void> {
  try {
    const allScores = await db
      .select()
      .from(challengeScores)
      .where(eq(challengeScores.scheduleId, scheduleId))
      .orderBy(desc(challengeScores.finalScore));

    const rank = allScores.findIndex((s) => s.userId === userId) + 1;

    const previousEntry = await db.query.challengeLeaderboards.findFirst({
      where: and(
        eq(challengeLeaderboards.scheduleId, scheduleId),
        eq(challengeLeaderboards.userId, userId)
      ),
    });

    const previousRank = previousEntry?.rank;
    const change = previousRank ? previousRank - rank : 0;

    if (previousEntry) {
      await db
        .update(challengeLeaderboards)
        .set({
          score,
          rank,
          previousRank,
          change,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(challengeLeaderboards.scheduleId, scheduleId),
            eq(challengeLeaderboards.userId, userId)
          )
        );
    } else {
      await db.insert(challengeLeaderboards).values({
        scheduleId,
        userId,
        leaderboardType: 'challenge',
        scope: 'global',
        score,
        rank,
        previousRank,
        change,
      });
    }
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    throw error;
  }
}
