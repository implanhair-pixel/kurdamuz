import { db } from '../../db/index';
import {
  xpTransactions,
  userLevels,
  levelDefinitions,
} from '../../db/schema';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import type {
  XPTransaction,
  XPTransactionInput,
  UserLevel,
  LevelProgress,
  TransactionType,
  XPSourceType,
} from '../../types/xp';
import { XPErrors, XPError } from '../../types/xp';
import { logXPTransaction } from './audits';

/**
 * Award XP to a user
 */
export async function awardXP(
  userId: string,
  amount: number,
  sourceType: XPSourceType,
  sourceId?: string,
  description?: string
): Promise<XPTransaction> {
  if (amount <= 0) {
    throw new XPError('XP amount must be positive', XPErrors.INVALID_XP_AMOUNT);
  }

  // Start a transaction
  return await db.transaction(async (tx) => {
    // Create XP transaction record
    const [transaction] = await tx
      .insert(xpTransactions)
      .values({
        userId,
        xpAmount: amount,
        transactionType: 'earned' as TransactionType,
        sourceType,
        sourceId,
        description,
      })
      .returning();

    // Get or create user level record
    let [userLevel] = await tx
      .select()
      .from(userLevels)
      .where(eq(userLevels.userId, userId));

    if (!userLevel) {
      // Create new user level record
      [userLevel] = await tx
        .insert(userLevels)
        .values({
          userId,
          currentLevel: 1,
          currentXP: 0,
          totalXP: 0,
          xpToNextLevel: 100,
        })
        .returning();
    }

    // Update user XP
    const newTotalXP = userLevel.totalXP + amount;
    const newCurrentXP = userLevel.currentXP + amount;

    // Check if user leveled up
    let leveledUp = false;
    let newLevel = userLevel.currentLevel;
    let newXpToNextLevel = userLevel.xpToNextLevel;

    while (newCurrentXP >= newXpToNextLevel) {
      leveledUp = true;
      newLevel++;
      
      // Get next level definition
      const [nextLevelDef] = await tx
        .select()
        .from(levelDefinitions)
        .where(eq(levelDefinitions.levelNumber, newLevel + 1));

      if (nextLevelDef) {
        newXpToNextLevel = nextLevelDef.requiredXP - newTotalXP;
      } else {
        // Calculate default progression if no definition exists
        newXpToNextLevel = Math.floor(newXpToNextLevel * 1.5);
      }
    }

    // Update user level record
    await tx
      .update(userLevels)
      .set({
        currentXP: newCurrentXP,
        totalXP: newTotalXP,
        currentLevel: newLevel,
        xpToNextLevel: newXpToNextLevel,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.userId, userId));

    // Log audit
    await logXPTransaction(userId, 'xp_granted', {
      amount,
      sourceType,
      sourceId,
      oldLevel: userLevel.currentLevel,
      newLevel,
    });

    return transaction;
  });
}

/**
 * Remove XP from a user (administrative action)
 */
export async function removeXP(
  userId: string,
  amount: number,
  actorId: string,
  reason?: string
): Promise<XPTransaction> {
  if (amount <= 0) {
    throw new XPError('XP amount must be positive', XPErrors.INVALID_XP_AMOUNT);
  }

  return await db.transaction(async (tx) => {
    // Get current user level
    const [userLevel] = await tx
      .select()
      .from(userLevels)
      .where(eq(userLevels.userId, userId));

    if (!userLevel) {
      throw new XPError('User not found', XPErrors.USER_NOT_FOUND);
    }

    if (userLevel.currentXP < amount) {
      throw new XPError('Insufficient XP balance', XPErrors.INVALID_XP_AMOUNT);
    }

    // Create XP transaction record
    const [transaction] = await tx
      .insert(xpTransactions)
      .values({
        userId,
        xpAmount: -amount,
        transactionType: 'removed' as TransactionType,
        sourceType: 'admin_bonus',
        description: reason || 'XP removed by administrator',
      })
      .returning();

    // Update user XP
    const newCurrentXP = userLevel.currentXP - amount;
    const newTotalXP = userLevel.totalXP - amount;

    await tx
      .update(userLevels)
      .set({
        currentXP: newCurrentXP,
        totalXP: newTotalXP,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.userId, userId));

    // Log audit
    await logXPTransaction(actorId, 'xp_removed', {
      targetUserId: userId,
      amount,
      reason,
      oldXP: userLevel.currentXP,
      newXP: newCurrentXP,
    });

    return transaction;
  });
}

/**
 * Correct XP (administrative action to fix errors)
 */
export async function correctXP(
  userId: string,
  oldAmount: number,
  newAmount: number,
  actorId: string,
  reason?: string
): Promise<XPTransaction> {
  const difference = newAmount - oldAmount;

  return await db.transaction(async (tx) => {
    // Get current user level
    const [userLevel] = await tx
      .select()
      .from(userLevels)
      .where(eq(userLevels.userId, userId));

    if (!userLevel) {
      throw new XPError('User not found', XPErrors.USER_NOT_FOUND);
    }

    // Create XP transaction record
    const [transaction] = await tx
      .insert(xpTransactions)
      .values({
        userId,
        xpAmount: difference,
        transactionType: 'corrected' as TransactionType,
        sourceType: 'admin_bonus',
        description: reason || 'XP correction',
      })
      .returning();

    // Update user XP
    const newCurrentXP = userLevel.currentXP + difference;
    const newTotalXP = userLevel.totalXP + difference;

    await tx
      .update(userLevels)
      .set({
        currentXP: newCurrentXP,
        totalXP: newTotalXP,
        updatedAt: new Date(),
      })
      .where(eq(userLevels.userId, userId));

    // Log audit
    await logXPTransaction(actorId, 'xp_corrected', {
      targetUserId: userId,
      oldAmount,
      newAmount,
      difference,
      reason,
    });

    return transaction;
  });
}

/**
 * Get user's current XP balance
 */
export async function getUserXPBalance(userId: string): Promise<number> {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  return userLevel?.totalXP || 0;
}

/**
 * Get user's current level and XP details
 */
export async function getUserLevel(userId: string): Promise<UserLevel | null> {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  return userLevel || null;
}

/**
 * Get XP transactions for a user
 */
export async function getXPTransactions(
  userId: string,
  filters?: {
    transactionType?: TransactionType;
    sourceType?: XPSourceType;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<XPTransaction[]> {
  const conditions = [eq(xpTransactions.userId, userId)];

  if (filters?.transactionType) {
    conditions.push(eq(xpTransactions.transactionType, filters.transactionType));
  }

  if (filters?.sourceType) {
    conditions.push(eq(xpTransactions.sourceType, filters.sourceType));
  }

  if (filters?.startDate) {
    conditions.push(gte(xpTransactions.createdAt, filters.startDate));
  }

  if (filters?.endDate) {
    conditions.push(lte(xpTransactions.createdAt, filters.endDate));
  }

  const query = db
    .select()
    .from(xpTransactions)
    .where(and(...conditions))
    .orderBy(desc(xpTransactions.createdAt));

  if (filters?.limit) {
    query.limit(filters.limit);
  }

  if (filters?.offset) {
    query.offset(filters.offset);
  }

  return await query;
}

/**
 * Calculate level from total XP
 */
export async function calculateLevelFromXP(totalXP: number): Promise<number> {
  const levelDefs = await db
    .select()
    .from(levelDefinitions)
    .orderBy(levelDefinitions.levelNumber);

  let level = 1;
  for (const def of levelDefs) {
    if (totalXP >= def.requiredXP) {
      level = def.levelNumber;
    } else {
      break;
    }
  }

  return level;
}

/**
 * Get user's level progress
 */
export async function getLevelProgress(userId: string): Promise<LevelProgress> {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  if (!userLevel) {
    return {
      currentLevel: 1,
      currentXP: 0,
      totalXP: 0,
      xpToNextLevel: 100,
      progressPercentage: 0,
      canLevelUp: false,
    };
  }

  const progressPercentage = userLevel.xpToNextLevel > 0
    ? (userLevel.currentXP / userLevel.xpToNextLevel) * 100
    : 0;

  return {
    currentLevel: userLevel.currentLevel,
    currentXP: userLevel.currentXP,
    totalXP: userLevel.totalXP,
    xpToNextLevel: userLevel.xpToNextLevel,
    progressPercentage,
    canLevelUp: userLevel.currentXP >= userLevel.xpToNextLevel,
  };
}

/**
 * Update user's level (recalculate based on total XP)
 */
export async function updateUserLevel(userId: string): Promise<void> {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  if (!userLevel) {
    throw new XPError('User not found', XPErrors.USER_NOT_FOUND);
  }

  const newLevel = await calculateLevelFromXP(userLevel.totalXP);

  // Get level definition for new level
  const [levelDef] = await db
    .select()
    .from(levelDefinitions)
    .where(eq(levelDefinitions.levelNumber, newLevel));

  // Get next level definition for XP to next level
  const [nextLevelDef] = await db
    .select()
    .from(levelDefinitions)
    .where(eq(levelDefinitions.levelNumber, newLevel + 1));

  const xpToNextLevel = nextLevelDef
    ? nextLevelDef.requiredXP - userLevel.totalXP
    : Math.floor(userLevel.xpToNextLevel * 1.5);

  await db
    .update(userLevels)
    .set({
      currentLevel: newLevel,
      xpToNextLevel,
      updatedAt: new Date(),
    })
    .where(eq(userLevels.userId, userId));
}

/**
 * Get total XP earned from a specific source
 */
export async function getTotalXPBySource(
  userId: string,
  sourceType: XPSourceType
): Promise<number> {
  const [result] = await db
    .select({
      total: sql<number>`sum(${xpTransactions.xpAmount})`,
    })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        eq(xpTransactions.sourceType, sourceType),
        eq(xpTransactions.transactionType, 'earned')
      )
    );

  return result?.total || 0;
}

/**
 * Get XP earned in a time period
 */
export async function getXPInTimePeriod(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<number> {
  const [result] = await db
    .select({
      total: sql<number>`sum(${xpTransactions.xpAmount})`,
    })
    .from(xpTransactions)
    .where(
      and(
        eq(xpTransactions.userId, userId),
        gte(xpTransactions.createdAt, startDate),
        lte(xpTransactions.createdAt, endDate),
        eq(xpTransactions.transactionType, 'earned')
      )
    );

  return result?.total || 0;
}
