import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { db } from '@/db';
import { courses, courseModules, lessons, userProgress } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { localePath, normalizeLocale } from '@/lib/locale';

export const dynamic = 'force-dynamic';

type ProgressRow = {
  id: string;
  userId: string;
  status: string;
  completionPercentage: number | null;
  score: number | null;
  completedAt: Date | null;
  lessonTitle: string | null;
  courseTitle: string | null;
  courseId: string | null;
};

function getRequestLocale() {
  return normalizeLocale(headers().get('x-next-intl-locale'), 'en');
}

async function getProgressOverview() {
  const rows = await db
    .select({
      id: userProgress.id,
      userId: userProgress.userId,
      status: userProgress.status,
      completionPercentage: userProgress.completionPercentage,
      score: userProgress.score,
      completedAt: userProgress.completedAt,
      lessonTitle: lessons.title,
      courseTitle: courses.title,
      courseId: courses.id,
    })
    .from(userProgress)
    .leftJoin(lessons, eq(userProgress.lessonId, lessons.id))
    .leftJoin(courseModules, eq(lessons.moduleId, courseModules.id))
    .leftJoin(courses, eq(courseModules.courseId, courses.id))
    .orderBy(desc(userProgress.completedAt));

  const typedRows = rows as ProgressRow[];
  const uniqueLearners = new Set(typedRows.map((row) => row.userId)).size;
  const completed = typedRows.filter((row) => row.status === 'completed').length;
  const inProgress = typedRows.filter((row) => row.status === 'in_progress').length;
  const averageCompletion = typedRows.length
    ? Math.round(typedRows.reduce((sum, row) => sum + (row.completionPercentage || 0), 0) / typedRows.length)
    : 0;
  const scoredRows = typedRows.filter((row) => typeof row.score === 'number');
  const averageScore = scoredRows.length
    ? Math.round(scoredRows.reduce((sum, row) => sum + (row.score || 0), 0) / scoredRows.length)
    : 0;

  return {
    rows: typedRows,
    uniqueLearners,
    completed,
    inProgress,
    averageCompletion,
    averageScore,
  };
}

export default async function AdminProgressPage() {
  const locale = getRequestLocale();
  const loginPath = localePath(locale, '/login');
  const dashboardPath = localePath(locale, '/dashboard');

  const user = await getCurrentUser();
  if (!user) redirect(loginPath);

  try {
    await requireMinRole('admin_super');
  } catch {
    redirect(dashboardPath);
  }

  const stats = await getProgressOverview();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Learner Progress</h1>
        <p className="text-lg text-gray-600">Real progress data from the lessons progress table</p>
      </header>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        {[
          { label: 'Active Learners', value: stats.uniqueLearners },
          { label: 'Completed Lessons', value: stats.completed },
          { label: 'In Progress', value: stats.inProgress },
          { label: 'Avg. Completion', value: `${stats.averageCompletion}%` },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader>
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-3xl">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Average Lesson Score</CardTitle>
            <CardDescription>Scores are aggregated from lesson progress rows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-gray-600">Average score</span>
              <span className="text-sm font-semibold">{stats.averageScore}%</span>
            </div>
            <Progress value={stats.averageScore} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Snapshot</CardTitle>
            <CardDescription>Latest completion rows across courses and lessons</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.rows.length === 0 ? (
              <p className="text-gray-600">No learner progress recorded yet.</p>
            ) : (
              stats.rows.slice(0, 5).map((row) => (
                <div key={row.id} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">{row.courseTitle || 'Unknown Course'}</p>
                      <p className="text-sm text-gray-600">{row.lessonTitle || 'Unknown Lesson'}</p>
                    </div>
                    <Badge
                      variant={
                        row.status === 'completed'
                          ? 'success'
                          : row.status === 'in_progress'
                          ? 'primary'
                          : 'secondary'
                      }
                    >
                      {row.status}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <Progress value={row.completionPercentage || 0} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Rows</CardTitle>
          <CardDescription>Latest activity pulled from the live database</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.rows.length === 0 ? (
            <p className="text-gray-600">No data available.</p>
          ) : (
            <div className="space-y-3">
              {stats.rows.slice(0, 20).map((row) => (
                <div
                  key={row.id}
                  className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">{row.courseTitle || 'Unknown Course'}</p>
                    <p className="text-sm text-gray-600">{row.lessonTitle || 'Unknown Lesson'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <Badge variant="secondary">{row.status}</Badge>
                    <span>{row.completionPercentage || 0}%</span>
                    {typeof row.score === 'number' && <span>Score: {row.score}%</span>}
                    {row.completedAt && <span>{new Date(row.completedAt).toLocaleDateString()}</span>}
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
