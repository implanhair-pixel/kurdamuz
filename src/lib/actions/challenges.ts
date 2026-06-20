// src/lib/actions/challenges.ts
'use server';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import {
  challengeDefinitions,
  challengeSchedules,
  challengeSubmissions,
  challengeScores,
  challengeLeaderboards,
} from '@/db/schema';
import { revalidatePath } from 'next/cache';
import {
  CreateChallengeDefinitionRequest,
  SubmitChallengeRequest,
  ReviewSubmissionRequest,
  DifficultyLevel,
} from '@/types/challenges';
import { calculateScore, saveScore } from '@/lib/challenges/scoring';
import { claimReward as claimChallengeReward } from '@/lib/challenges/rewards';
import { detectFraud, shouldFlagSubmission } from '@/lib/challenges/fraud-detection';
import { validateSubmission } from '@/lib/challenges/validation';
import { eq, and } from 'drizzle-orm';


const DIFFICULTY_LEVELS: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

function toDifficultyLevel(value: unknown): DifficultyLevel | undefined {
  return typeof value === 'string' && (DIFFICULTY_LEVELS as readonly string[]).includes(value)
    ? (value as DifficultyLevel)
    : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}


// Create Challenge Definition
export async function createChallengeDefinition(
  data: CreateChallengeDefinitionRequest
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  const [definition] = await db.insert(challengeDefinitions).values({
    ...data,
    createdBy: user.id,
  }).returning();

  revalidatePath('/admin/challenges');
  return definition;
}

// Submit Challenge
export async function submitChallenge(data: SubmitChallengeRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  // Validate submission
  const validation = await validateSubmission(
    data.scheduleId,
    user.id,
    data.submissionData
  );

  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  // Detect fraud
  const fraudScore = await detectFraud({
    userId: user.id,
    submissionData: data.submissionData,
    timeTaken: data.timeTaken,
    scheduleId: data.scheduleId,
  });

  // Create submission
  const [submission] = await db.insert(challengeSubmissions).values({
    scheduleId: data.scheduleId,
    userId: user.id,
    submissionData: data.submissionData,
    timeTaken: data.timeTaken,
    fraudScore,
    status: shouldFlagSubmission(fraudScore) ? 'flagged' : 'pending',
  }).returning();

  // Calculate score if not flagged
  if (!shouldFlagSubmission(fraudScore)) {
    const schedule = await db.query.challengeSchedules.findFirst({
      where: eq(challengeSchedules.id, data.scheduleId),
    });

    const definition = schedule
      ? await db.query.challengeDefinitions.findFirst({
          where: eq(challengeDefinitions.id, schedule.challengeDefinitionId),
        })
      : null;

    const scoringResult = await calculateScore({
      submissionData: data.submissionData,
      timeTaken: data.timeTaken,
      timeLimit: toOptionalNumber(definition?.timeLimit),
      difficultyLevel: toDifficultyLevel(definition?.difficultyLevel),
      userId: user.id,
      scheduleId: data.scheduleId,
      submissionId: submission.id,
    });

    await saveScore(submission.id, user.id, data.scheduleId, scoringResult);
  }

  revalidatePath('/challenges');
  return { submissionId: submission.id, fraudScore };
}

// Get User Leaderboard Position
export async function getUserLeaderboardPosition(
  leaderboardType: string,
  scope?: string
) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  const position = await db.query.challengeLeaderboards.findFirst({
    where: and(
      eq(challengeLeaderboards.userId, user.id),
      eq(challengeLeaderboards.leaderboardType, leaderboardType),
      scope ? eq(challengeLeaderboards.scope, scope) : undefined
    ),
  });

  return position;
}

// Claim Reward
export async function claimReward(rewardId: string) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  const reward = await claimChallengeReward(user.id, rewardId);

  revalidatePath('/challenges/rewards');
  return reward;
}

// Review Submission
export async function reviewSubmission(data: ReviewSubmissionRequest) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  const [submission] = await db
    .update(challengeSubmissions)
    .set({
      status: data.action === 'approve' ? 'approved' : data.action === 'reject' ? 'rejected' : 'flagged',
      reviewStatus: 'teacher_review',
      reviewedBy: user.id,
      reviewedAt: new Date(),
      reviewNotes: data.reviewNotes,
    })
    .where(eq(challengeSubmissions.id, data.submissionId))
    .returning();

  if (!submission) {
    throw new Error('Submission not found');
  }

  // If approved, calculate score
  if (data.action === 'approve') {
    const schedule = await db.query.challengeSchedules.findFirst({
      where: eq(challengeSchedules.id, submission.scheduleId),
    });

    const definition = schedule
      ? await db.query.challengeDefinitions.findFirst({
          where: eq(challengeDefinitions.id, schedule.challengeDefinitionId),
        })
      : null;

    const scoringResult = await calculateScore({
      submissionData: submission.submissionData,
      timeTaken: toOptionalNumber(submission.timeTaken),
      timeLimit: toOptionalNumber(definition?.timeLimit),
      difficultyLevel: toDifficultyLevel(definition?.difficultyLevel),
      userId: submission.userId,
      scheduleId: submission.scheduleId,
      submissionId: submission.id,
    });

    await saveScore(submission.id, submission.userId, submission.scheduleId, scoringResult);
  }

  revalidatePath('/admin/challenges/submissions');
  return submission;
}

// Create Challenge Schedule
export async function createChallengeSchedule(data: {
  challengeDefinitionId: string;
  title: string;
  description?: string;
  scheduledDate: Date;
  scheduledTime: Date;
  endDate?: Date;
  timezone?: string;
}) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  const [schedule] = await db.insert(challengeSchedules).values({
    ...data,
    timezone: data.timezone || 'UTC',
  }).returning();

  revalidatePath('/admin/challenges/schedules');
  return schedule;
}

// Approve Schedule
export async function approveSchedule(scheduleId: string, approved: boolean) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  const [schedule] = await db
    .update(challengeSchedules)
    .set({
      publicationStatus: approved ? 'approved' : 'rejected',
      approvedBy: user.id,
      approvedAt: new Date(),
    })
    .where(eq(challengeSchedules.id, scheduleId))
    .returning();

  if (!schedule) {
    throw new Error('Schedule not found');
  }

  revalidatePath('/admin/challenges/schedules');
  return schedule;
}

// Publish Schedule
export async function publishSchedule(scheduleId: string) {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  const [schedule] = await db
    .update(challengeSchedules)
    .set({
      status: 'published',
    })
    .where(eq(challengeSchedules.id, scheduleId))
    .returning();

  if (!schedule) {
    throw new Error('Schedule not found');
  }

  revalidatePath('/admin/challenges/schedules');
  return schedule;
}
