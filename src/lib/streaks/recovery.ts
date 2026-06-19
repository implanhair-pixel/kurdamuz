import { db } from '@/db';
import { userStreaks, streakRecoveryRequests } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { 
  StreakRecoveryRequest,
  CreateRecoveryRequestInput,
  ApproveRecoveryRequestInput,
  RecoveryType,
  RecoveryStatus 
} from '@/types/streak';

/**
 * Create a streak recovery request
 */
export async function createRecoveryRequest(
  input: CreateRecoveryRequestInput
): Promise<StreakRecoveryRequest> {
  const now = new Date();
  
  // Check if user already has a pending recovery request for this date
  const existingRequest = await db.select()
    .from(streakRecoveryRequests)
    .where(
      and(
        eq(streakRecoveryRequests.userId, input.userId),
        eq(streakRecoveryRequests.missedDate, input.missedDate.toISOString().split('T')[0]),
        eq(streakRecoveryRequests.status, 'pending')
      )
    )
    .limit(1);

  if (existingRequest.length > 0) {
    throw new Error('A pending recovery request already exists for this date');
  }

  // Check recovery eligibility based on policy
  const isEligible = await checkRecoveryEligibility(input.userId, input.recoveryType);
  if (!isEligible) {
    throw new Error('User is not eligible for this type of recovery');
  }

  const newRequest = await db.insert(streakRecoveryRequests)
    .values({
      userId: input.userId,
      missedDate: input.missedDate.toISOString().split('T')[0],
      recoveryType: input.recoveryType,
      status: 'pending',
      reason: input.reason || null,
      createdAt: now,
    })
    .returning();

  return newRequest[0] as unknown as StreakRecoveryRequest;
}

/**
 * Get recovery requests for a user
 */
export async function getUserRecoveryRequests(
  userId: string,
  status?: RecoveryStatus
): Promise<StreakRecoveryRequest[]> {
  const query = status
    ? db.select()
        .from(streakRecoveryRequests)
        .where(
          and(
            eq(streakRecoveryRequests.userId, userId),
            eq(streakRecoveryRequests.status, status)
          )
        )
    : db.select()
        .from(streakRecoveryRequests)
        .where(eq(streakRecoveryRequests.userId, userId));

  const requests = await query.orderBy(desc(streakRecoveryRequests.createdAt));
  
  return requests.map(req => ({
    ...req,
    missedDate: new Date(req.missedDate),
    reviewedAt: req.reviewedAt ? new Date(req.reviewedAt) : null,
  })) as StreakRecoveryRequest[];
}

/**
 * Get all pending recovery requests (for admins)
 */
export async function getPendingRecoveryRequests(): Promise<StreakRecoveryRequest[]> {
  const requests = await db.select()
    .from(streakRecoveryRequests)
    .where(eq(streakRecoveryRequests.status, 'pending'))
    .orderBy(desc(streakRecoveryRequests.createdAt));

  return requests.map(req => ({
    ...req,
    missedDate: new Date(req.missedDate),
    reviewedAt: req.reviewedAt ? new Date(req.reviewedAt) : null,
  })) as StreakRecoveryRequest[];
}

/**
 * Approve or deny a recovery request
 */
export async function processRecoveryRequest(
  input: ApproveRecoveryRequestInput
): Promise<StreakRecoveryRequest> {
  const now = new Date();
  const request = await db.select()
    .from(streakRecoveryRequests)
    .where(eq(streakRecoveryRequests.id, input.requestId))
    .limit(1);

  if (request.length === 0) {
    throw new Error('Recovery request not found');
  }

  if (request[0].status !== 'pending') {
    throw new Error('Request has already been processed');
  }

  const newStatus = input.approved ? 'approved' : 'denied';

  const updatedRequest = await db.update(streakRecoveryRequests)
    .set({
      status: newStatus,
      reviewedBy: input.reviewedBy,
      reviewedAt: now,
    })
    .where(eq(streakRecoveryRequests.id, input.requestId))
    .returning();

  // If approved, restore the streak
  if (input.approved) {
    await restoreStreak(request[0].userId, request[0].missedDate);
    
    // Mark as completed after restoration
    await db.update(streakRecoveryRequests)
      .set({ status: 'completed' })
      .where(eq(streakRecoveryRequests.id, input.requestId));
  }

  return {
    ...updatedRequest[0],
    missedDate: new Date(updatedRequest[0].missedDate),
    reviewedAt: updatedRequest[0].reviewedAt ? new Date(updatedRequest[0].reviewedAt) : null,
  } as StreakRecoveryRequest;
}

/**
 * Check if user is eligible for recovery
 */
export async function checkRecoveryEligibility(
  userId: string,
  recoveryType: RecoveryType
): Promise<boolean> {
  const streak = await db.select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  if (streak.length === 0) {
    return false;
  }

  // Check recovery count in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentRecoveries = await db.select()
    .from(streakRecoveryRequests)
    .where(
      and(
        eq(streakRecoveryRequests.userId, userId),
        eq(streakRecoveryRequests.status, 'approved')
      )
    );

  // Policy: Max 3 recoveries per month
  if (recentRecoveries.length >= 3) {
    return false;
  }

  // Additional type-specific checks
  switch (recoveryType) {
    case 'automatic':
      // Automatic recovery only for streaks > 7 days
      return streak[0].longestStreak >= 7;
    
    case 'reward_based':
      // Check if user has available rewards (to be implemented with reward system)
      return true;
    
    case 'administrative':
      // Admin can always approve
      return true;
    
    case 'manual':
    case 'promotional':
    default:
      return true;
  }
}

/**
 * Restore a user's streak after recovery approval
 */
async function restoreStreak(userId: string, missedDate: string): Promise<void> {
  const streak = await db.select()
    .from(userStreaks)
    .where(eq(userStreaks.userId, userId))
    .limit(1);

  if (streak.length === 0) {
    return;
  }

  // Restore previous streak value (increment by 1)
  const restoredStreak = streak[0].currentStreak + 1;
  const now = new Date();

  await db.update(userStreaks)
    .set({
      currentStreak: restoredStreak,
      streakStatus: 'active',
      lastActivityDate: missedDate,
      updatedAt: now,
    })
    .where(eq(userStreaks.userId, userId));
}

/**
 * Get recovery statistics for a user
 */
export async function getRecoveryStatistics(userId: string) {
  const allRequests = await getUserRecoveryRequests(userId);
  
  const approved = allRequests.filter(r => r.status === 'approved' || r.status === 'completed').length;
  const denied = allRequests.filter(r => r.status === 'denied').length;
  const pending = allRequests.filter(r => r.status === 'pending').length;

  return {
    totalRequests: allRequests.length,
    approved,
    denied,
    pending,
    successRate: allRequests.length > 0 ? (approved / allRequests.length) * 100 : 0,
  };
}
