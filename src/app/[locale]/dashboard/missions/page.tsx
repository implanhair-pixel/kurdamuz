import { MissionCard } from '@/components/missions/MissionCard';
import { MissionHistory } from '@/components/missions/MissionHistory';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { MissionDefinition } from '@/lib/missions/mission-engine';

export default async function MissionsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  // TODO: Fetch actual mission data from API
  const missions: MissionDefinition[] = [];
  const history: { missionName: string; completionResult: 'success' | 'failed' | 'expired'; xpAwarded: number; coinAwarded: number; completedAt: Date }[] = [];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Daily Missions</h1>
        <p className="text-muted-foreground">Complete missions to earn coins and XP</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Available Missions</h2>
          {missions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No missions available right now. Check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  {...mission}
                  progress={0}
                  target={1}
                  completionStatus="not_started"
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
