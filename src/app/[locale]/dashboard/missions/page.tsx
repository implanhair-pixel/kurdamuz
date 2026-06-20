import { MissionCard } from '@/components/missions/MissionCard';
import { MissionHistory } from '@/components/missions/MissionHistory';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { localePath } from '@/lib/locale';
import type { MissionDefinition } from '@/lib/missions/mission-engine';
import { missionEngine } from '@/lib/missions/mission-engine';
import { db } from '@/db';
import { missionDefinitions, missionHistory, userMissions } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

function getMissionTarget(criteria: any) {
  return Math.max(1, Number(criteria?.target_value ?? criteria?.targetCount ?? criteria?.count ?? 1));
}

export default async function MissionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect(localePath(locale, '/login'));
  }

  const [availableMissions, activeMissionRows, historyRows] = await Promise.all([
    missionEngine.getAvailableMissions(user.id).catch(() => [] as MissionDefinition[]),
    db
      .select({
        mission: userMissions,
        definition: missionDefinitions,
      })
      .from(userMissions)
      .innerJoin(missionDefinitions, eq(userMissions.missionId, missionDefinitions.id))
      .where(eq(userMissions.userId, user.id))
      .orderBy(desc(userMissions.completedAt)),
    db
      .select({
        missionName: missionDefinitions.name,
        completionResult: missionHistory.completionResult,
        xpAwarded: missionDefinitions.xpReward,
        coinAwarded: missionDefinitions.coinReward,
        completedAt: missionHistory.createdAt,
      })
      .from(missionHistory)
      .innerJoin(missionDefinitions, eq(missionHistory.missionId, missionDefinitions.id))
      .where(eq(missionHistory.userId, user.id))
      .orderBy(desc(missionHistory.createdAt))
      .limit(10),
  ]);

  const history = historyRows.map((row) => ({
    missionName: row.missionName,
    completionResult: row.completionResult as 'success' | 'failed' | 'expired',
    xpAwarded: Number(row.xpAwarded || 0),
    coinAwarded: Number(row.coinAwarded || 0),
    completedAt: row.completedAt ?? new Date(),
  }));

  const missionCards = (availableMissions.length > 0 ? availableMissions : activeMissionRows.map((row) => row.definition as MissionDefinition)).map((mission) => ({
    ...mission,
    progress: 0,
    target: getMissionTarget(mission.criteria),
    completionStatus: 'not_started' as const,
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Missions</h1>
        <p className="text-muted-foreground">Complete missions to earn coins and XP</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Available Missions</h2>
          {missionCards.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No missions available right now. Check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missionCards.map((mission) => (
                <MissionCard
                  key={mission.id}
                  {...mission}
                />
              ))}
            </div>
          )}
        </div>
        <div>
          <MissionHistory history={history} />
        </div>
      </div>
    </div>
  );
}
