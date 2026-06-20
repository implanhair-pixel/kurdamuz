import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { db } from '@/db';
import { stories, storyCompletions, storyProgress } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { localePath, normalizeLocale } from '@/lib/locale';

export const dynamic = 'force-dynamic';

function getRequestLocale() {
  return normalizeLocale(headers().get('x-next-intl-locale'), 'en');
}

function formatPercent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

export default async function StoryAnalyticsPage() {
  const locale = getRequestLocale();
  const loginPath = localePath(locale, '/login');
  const dashboardPath = localePath(locale, '/dashboard');

  const user = await getCurrentUser();
  if (!user) {
    redirect(loginPath);
  }

  try {
    await requireMinRole('admin_super');
  } catch {
    redirect(dashboardPath);
  }

  const [publishedStoriesRows, completionsRows, activeReadersRows, avgCompletionRows, topStoriesRows] = await Promise.all([
    db.select({ value: sql<number>`count(*)` }).from(stories).where(eq(stories.status, 'published')),
    db.select({ value: sql<number>`count(*)` }).from(storyCompletions),
    db
      .select({ value: sql<number>`count(distinct ${storyProgress.userId})` })
      .from(storyProgress)
      .where(sql`${storyProgress.lastReadAt} >= NOW() - INTERVAL '30 days'`),
    db
      .select({ value: sql<number>`COALESCE(AVG(${storyProgress.completionPercentage}), 0)` })
      .from(storyProgress),
    db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        completionCount: sql<number>`count(${storyCompletions.id})`,
        avgCompletion: sql<number>`COALESCE(AVG(${storyProgress.completionPercentage}), 0)`,
      })
      .from(stories)
      .leftJoin(storyProgress, eq(storyProgress.storyId, stories.id))
      .leftJoin(storyCompletions, eq(storyCompletions.storyId, stories.id))
      .where(eq(stories.status, 'published'))
      .groupBy(stories.id)
      .orderBy(desc(sql`count(${storyCompletions.id})`))
      .limit(5),
  ]);

  const publishedStories = Number(publishedStoriesRows[0]?.value ?? 0);
  const totalCompletions = Number(completionsRows[0]?.value ?? 0);
  const activeReaders = Number(activeReadersRows[0]?.value ?? 0);
  const avgCompletionRate = Number(avgCompletionRows[0]?.value ?? 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Story Analytics</h1>
        <p className="text-muted-foreground">Track story performance and engagement</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{publishedStories}</div>
            <p className="text-xs text-muted-foreground">Published stories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCompletions}</div>
            <p className="text-xs text-muted-foreground">Story completions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Active Readers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeReaders}</div>
            <p className="text-xs text-muted-foreground">Users reading stories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatPercent(avgCompletionRate)}</div>
            <p className="text-xs text-muted-foreground">Average progress across readers</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Story Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {topStoriesRows.length === 0 ? (
            <p className="text-muted-foreground">No story activity yet.</p>
          ) : (
            <div className="space-y-3">
              {topStoriesRows.map((story) => (
                <div key={story.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{story.title}</div>
                    <div className="text-xs text-muted-foreground">/{story.slug}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{Number(story.completionCount || 0)} completions</Badge>
                    <Badge variant="secondary">{formatPercent(Number(story.avgCompletion || 0))} avg completion</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
