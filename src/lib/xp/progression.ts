import { db } from '../../db/index';
import { userLevels, levelDefinitions } from '../../db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import type { LevelDefinition, LevelDefinitionInput, LevelUpEvent } from '../../types/xp';
import { XPErrors, XPError } from '../../types/xp';
import { logXPTransaction } from './audits';

/**
 * Get current level for a user
 */
export async function getCurrentLevel(userId: string): Promise<number> {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  return userLevel?.currentLevel || 1;
}

/**
 * Get user's level record
 */
export async function getUserLevel(userId: string) {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  return userLevel || null;
}

/**
 * Get XP required to reach the next level
 */
export async function getXPToNextLevel(userId: string): Promise<number> {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  return userLevel?.xpToNextLevel || 100;
}

/**
 * Get level definition by level number
 */
export async function getLevelDefinition(
  levelNumber: number
): Promise<LevelDefinition | null> {
  const [levelDef] = await db
    .select()
    .from(levelDefinitions)
    .where(eq(levelDefinitions.levelNumber, levelNumber));

  return levelDef || null;
}

/**
 * Get all level definitions
 */
export async function getAllLevelDefinitions(): Promise<LevelDefinition[]> {
  return await db
    .select()
    .from(levelDefinitions)
    .orderBy(levelDefinitions.levelNumber);
}

/**
 * Create a new level definition
 */
export async function createLevelDefinition(
  data: LevelDefinitionInput,
  actorId: string
): Promise<LevelDefinition> {
  const [levelDef] = await db
    .insert(levelDefinitions)
    .values({
      levelNumber: data.levelNumber,
      requiredXP: data.requiredXP,
      title: data.title,
      badgeId: data.badgeId,
    })
    .returning();

  // Log audit
  await logXPTransaction(actorId, 'policy_modified', {
    action: 'create_level_definition',
    levelNumber: data.levelNumber,
    requiredXP: data.requiredXP,
  });

  return levelDef;
}

/**
 * Update a level definition
 */
export async function updateLevelDefinition(
  levelNumber: number,
  data: Partial<LevelDefinitionInput>,
  actorId: string
): Promise<LevelDefinition> {
  const [levelDef] = await db
    .update(levelDefinitions)
    .set({
      requiredXP: data.requiredXP,
      title: data.title,
      badgeId: data.badgeId,
    })
    .where(eq(levelDefinitions.levelNumber, levelNumber))
    .returning();

  if (!levelDef) {
    throw new XPError('Level not found', XPErrors.LEVEL_NOT_FOUND);
  }

  // Log audit
  await logXPTransaction(actorId, 'policy_modified', {
    action: 'update_level_definition',
    levelNumber,
    oldData: levelDef,
    newData: data,
  });

  return levelDef;
}

/**
 * Delete a level definition
 */
export async function deleteLevelDefinition(
  levelNumber: number,
  actorId: string
): Promise<void> {
  const [levelDef] = await db
    .delete(levelDefinitions)
    .where(eq(levelDefinitions.levelNumber, levelNumber))
    .returning();

  if (!levelDef) {
    throw new XPError('Level not found', XPErrors.LEVEL_NOT_FOUND);
  }

  // Log audit
  await logXPTransaction(actorId, 'policy_modified', {
    action: 'delete_level_definition',
    levelNumber,
    deletedData: levelDef,
  });
}

/**
 * Check if user can level up
 */
export async function checkLevelUp(userId: string): Promise<boolean> {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  if (!userLevel) {
    return false;
  }

  return userLevel.currentXP >= userLevel.xpToNextLevel;
}

/**
 * Recalculate user's level based on total XP
 */
export async function recalculateUserLevels(userId: string): Promise<LevelUpEvent | null> {
  const [userLevel] = await db
    .select()
    .from(userLevels)
    .where(eq(userLevels.userId, userId));

  if (!userLevel) {
    throw new XPError('User not found', XPErrors.USER_NOT_FOUND);
  }

  const oldLevel = userLevel.currentLevel;
  const newLevel = await calculateLevelFromTotalXP(userLevel.totalXP);

  if (newLevel === oldLevel) {
    return null;
  }

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

  // Update user level
  await db
    .update(userLevels)
    .set({
      currentLevel: newLevel,
      xpToNextLevel,
      updatedAt: new Date(),
    })
    .where(eq(userLevels.userId, userId));

  const levelUpEvent: LevelUpEvent = {
    userId,
    oldLevel,
    newLevel,
    xpAtLevelUp: userLevel.totalXP,
    timestamp: new Date(),
  };

  // Log audit
  await logXPTransaction(userId, 'level_up', {
    oldLevel,
    newLevel,
    xpAtLevelUp: userLevel.totalXP,
  });

  return levelUpEvent;
}

/**
 * Calculate level from total XP
 */
async function calculateLevelFromTotalXP(totalXP: number): Promise<number> {
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
 * Initialize default level definitions
 */
export async function initializeDefaultLevelDefinitions(): Promise<void> {
  const existingDefs = await db
    .select()
    .from(levelDefinitions)
    .orderBy(levelDefinitions.levelNumber);

  if (existingDefs.length > 0) {
    return; // Already initialized
  }

  const defaultLevels = [
    { levelNumber: 1, requiredXP: 0, title: 'Novice' },
    { levelNumber: 2, requiredXP: 100, title: 'Beginner' },
    { levelNumber: 3, requiredXP: 250, title: 'Apprentice' },
    { levelNumber: 4, requiredXP: 450, title: 'Learner' },
    { levelNumber: 5, requiredXP: 700, title: 'Student' },
    { levelNumber: 6, requiredXP: 1000, title: 'Scholar' },
    { levelNumber: 7, requiredXP: 1400, title: 'Expert' },
    { levelNumber: 8, requiredXP: 1900, title: 'Master' },
    { levelNumber: 9, requiredXP: 2500, title: 'Grandmaster' },
    { levelNumber: 10, requiredXP: 3200, title: 'Legend' },
  ];

  await db.insert(levelDefinitions).values(defaultLevels);
}

/**
 * Get level distribution across platform
 */
export async function getLevelDistribution(): Promise<
  Array<{ level: number; count: number }>
> {
  const results = await db
    .select({
      level: userLevels.currentLevel,
      count: sql<number>`count(*)`,
    })
    .from(userLevels)
    .groupBy(userLevels.currentLevel)
    .orderBy(userLevels.currentLevel);

  return results;
}

/**
 * Get users at a specific level
 */
export async function getUsersAtLevel(
  level: number,
  limit: number = 50
): Promise<Array<{ userId: string; totalXP: number }>> {
  return await db
    .select({
      userId: userLevels.userId,
      totalXP: userLevels.totalXP,
    })
    .from(userLevels)
    .where(eq(userLevels.currentLevel, level))
    .orderBy(sql`${userLevels.totalXP} DESC`)
    .limit(limit);
}
