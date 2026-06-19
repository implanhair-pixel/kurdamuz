import { LeaderboardTable } from '@/components/challenges/LeaderboardTable';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { challengeLeaderboards, challengeSchedules } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

export default async function LeaderboardsPage() {
  const user = await getCurrentUser();
  
  // Get the most recent active challenge leaderboard
  const recentSchedule = await db.query.challengeSchedules.findFirst({
    where: eq(challengeSchedules.status, 'active'),
    orderBy: (schedules, { desc }) => [desc(schedules.scheduledDate)],
  });

  let leaderboardEntries: { rank: number; user: { id: string; name: string; avatar?: string }; score: number; change?: number }[] = [];
  let currentUserId = user?.id;

  if (recentSchedule) {
    const entries = await db.query.challengeLeaderboards.findMany({
      where: eq(challengeLeaderboards.scheduleId, recentSchedule.id),
      orderBy: (leaderboards, { asc }) => [asc(leaderboards.rank)],
      limit: 50,
    });

    // Get user information for each entry
    leaderboardEntries = await Promise.all(
      entries.map(async (entry) => ({
        rank: entry.rank ?? 0,
        user: {
          id: entry.userId,
          name: `User ${entry.userId.substring(0, 8)}`,
          avatar: undefined,
        },
        score: entry.score ?? 0,
        change: entry.change ?? undefined,
      }))
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Leaderboards</h1>
        <p className="text-muted-foreground">
          See how you rank against other learners
        </p>
      </div>

      {recentSchedule ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">{recentSchedule.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Challenge Leaderboard
            </p>
            <LeaderboardTable
              entries={leaderboardEntries}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No active leaderboards available
        </div>
      )}
    </div>
  );
}
