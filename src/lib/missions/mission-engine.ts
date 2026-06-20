import { db } from '@/db';
import { missionDefinitions, missionSchedules, userMissions, missionHistory } from '@/db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { ProgressTracker } from './progress-tracker';
import { RewardDistributor } from './reward-distributor';

export interface MissionDefinition {
  id: string;
  name: string;
  description?: string;
  missionType: 'daily_login' | 'lesson_completion' | 'quiz_completion' | 'vocabulary' | 'streak';
  difficulty: 'easy' | 'medium' | 'hard';
  criteria: any;
  xpReward: number;
  coinReward: number;
  active: boolean;
  createdAt: Date;
}

export interface UserMission {
  id: string;
  userId: string;
  missionId: string;
  progressValue: number;
  completionStatus: 'not_started' | 'in_progress' | 'completed' | 'expired';
  xpAwarded: number;
  coinAwarded: number;
  completedAt?: Date;
}

export class MissionEngine {
  private progressTracker: ProgressTracker;
  private rewardDistributor: RewardDistributor;

  constructor() {
    this.progressTracker = new ProgressTracker();
    this.rewardDistributor = new RewardDistributor();
  }

  async getAvailableMissions(userId: string): Promise<MissionDefinition[]> {
    const now = new Date();

    const activeSchedules = await db
      .select({
        definition: missionDefinitions,
        schedule: missionSchedules,
      })
      .from(missionSchedules)
      .innerJoin(missionDefinitions, eq(missionSchedules.missionId, missionDefinitions.id))
      .where(
        and(
          eq(missionSchedules.status, 'active'),
          eq(missionDefinitions.active, true),
          lte(missionSchedules.startAt, now),
          gte(missionSchedules.endAt, now)
        )
      )
      .orderBy(desc(missionSchedules.createdAt));

    const completedMissionIds = await this.getCompletedMissionIds(userId);

    return activeSchedules
      .filter((row) => !completedMissionIds.includes(row.definition.id))
      .map((row) => row.definition as MissionDefinition);
  }

  async getUserMissions(userId: string): Promise<UserMission[]> {
    const missions = await db
      .select()
      .from(userMissions)
      .where(eq(userMissions.userId, userId));

    return missions as UserMission[];
  }

  async getMissionById(missionId: string): Promise<MissionDefinition | null> {
    const missions = await db
      .select()
      .from(missionDefinitions)
      .where(eq(missionDefinitions.id, missionId))
      .limit(1);

    return (missions[0] as MissionDefinition) || null;
  }

  async assignMission(userId: string, missionId: string): Promise<UserMission> {
    const existing = await db
      .select()
      .from(userMissions)
      .where(
        and(
          eq(userMissions.userId, userId),
          eq(userMissions.missionId, missionId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0] as UserMission;
    }

    const mission = await db
      .insert(userMissions)
      .values({
        userId,
        missionId,
        progressValue: 0,
        completionStatus: 'not_started',
        xpAwarded: 0,
        coinAwarded: 0,
      })
      .returning();

    return mission[0] as UserMission;
  }

  async updateMissionProgress(
    userId: string,
    missionId: string,
    progressValue: number
  ): Promise<UserMission> {
    const mission = await this.getMissionById(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    const userMission = await this.assignMission(userId, missionId);

    const isCompleted = await this.progressTracker.checkCompletion(mission, progressValue);
    const completionStatus = isCompleted ? 'completed' : 'in_progress';

    const updated = await db
      .update(userMissions)
      .set({
        progressValue,
        completionStatus,
        completedAt: isCompleted ? new Date() : null,
      })
      .where(eq(userMissions.id, userMission.id))
      .returning();

    if (isCompleted) {
      await this.completeMission(userId, missionId);
    }

    return updated[0] as UserMission;
  }

  async completeMission(userId: string, missionId: string): Promise<void> {
    const mission = await this.getMissionById(missionId);
    if (!mission) {
      throw new Error('Mission not found');
    }

    const userMission = await db
      .select()
      .from(userMissions)
      .where(
        and(
          eq(userMissions.userId, userId),
          eq(userMissions.missionId, missionId)
        )
      )
      .limit(1);

    if (userMission.length === 0) {
      throw new Error('User mission not found');
    }

    await this.rewardDistributor.distributeRewards(
      userId,
      mission.xpReward,
      mission.coinReward,
      'mission_completion',
      missionId
    );

    await db
      .update(userMissions)
      .set({
        xpAwarded: mission.xpReward,
        coinAwarded: mission.coinReward,
        completedAt: new Date(),
        completionStatus: 'completed',
      })
      .where(eq(userMissions.id, userMission[0].id));

    await db.insert(missionHistory).values({
      userId,
      missionId,
      completionResult: 'success',
      rewardSnapshot: {
        xp: mission.xpReward,
        coins: mission.coinReward,
      },
    });
  }

  private async getCompletedMissionIds(userId: string): Promise<string[]> {
    const history = await db
      .select({ missionId: missionHistory.missionId })
      .from(missionHistory)
      .where(
        and(
          eq(missionHistory.userId, userId),
          eq(missionHistory.completionResult, 'success')
        )
      );

    return history.map((h) => h.missionId);
  }
}

export const missionEngine = new MissionEngine();
