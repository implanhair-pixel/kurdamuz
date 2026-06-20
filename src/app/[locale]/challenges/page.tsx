import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { challengeSchedules, challengeDefinitions } from '@/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';

export default async function ChallengesPage() {
  const user = await getCurrentUser();

  const now = new Date();

  let activeChallenges: any[] = [];
  let upcomingChallenges: any[] = [];

  try {
    // Get active challenges
    activeChallenges = await db
      .select({
        schedule: challengeSchedules,
        definition: challengeDefinitions,
      })
      .from(challengeSchedules)
      .leftJoin(
        challengeDefinitions,
        eq(challengeSchedules.challengeDefinitionId, challengeDefinitions.id)
      )
      .where(
        and(
          eq(challengeSchedules.status, 'active'),
          gte(challengeSchedules.scheduledTime, now),
          lte(challengeSchedules.endDate, now)
        )
      )
      .limit(10);
  } catch {
    // Database tables not yet available
  }

  try {
    // Get upcoming challenges
    upcomingChallenges = await db
      .select({
        schedule: challengeSchedules,
        definition: challengeDefinitions,
      })
      .from(challengeSchedules)
      .leftJoin(
        challengeDefinitions,
        eq(challengeSchedules.challengeDefinitionId, challengeDefinitions.id)
      )
      .where(
        and(
          eq(challengeSchedules.status, 'scheduled'),
          eq(challengeSchedules.publicationStatus, 'approved'),
          gte(challengeSchedules.scheduledTime, now)
        )
      )
      .limit(5);
  } catch {
    // Database tables not yet available
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Daily Challenges</h1>
          <p className="text-muted-foreground">
            Test your skills and earn rewards
          </p>
        </div>
        {user && (
          <Button variant="outline">View My Progress</Button>
        )}
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Active Challenges</h2>
        {activeChallenges.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No active challenges available right now
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeChallenges.map(({ schedule, definition }) => (
              <ChallengeCard
                key={schedule.id}
                challenge={{
                  id: schedule.id,
                  title: schedule.title,
                  description: schedule.description || definition?.description || '',
                  challengeType: definition?.challengeType || 'quiz',
                  difficultyLevel: definition?.difficultyLevel || 'beginner',
                  scheduledDate: new Date(schedule.scheduledDate),
                  endDate: schedule.endDate ? new Date(schedule.endDate) : new Date(),
                  participantCount: 0, // Would be calculated from submissions
                  xpReward: definition?.xpReward || 0,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Upcoming Challenges</h2>
        {upcomingChallenges.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No upcoming challenges scheduled
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingChallenges.map(({ schedule, definition }) => (
              <ChallengeCard
                key={schedule.id}
                challenge={{
                  id: schedule.id,
                  title: schedule.title,
                  description: schedule.description || definition?.description || '',
                  challengeType: definition?.challengeType || 'quiz',
                  difficultyLevel: definition?.difficultyLevel || 'beginner',
                  scheduledDate: new Date(schedule.scheduledDate),
                  endDate: schedule.endDate ? new Date(schedule.endDate) : new Date(),
                  participantCount: 0,
                  xpReward: definition?.xpReward || 0,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
