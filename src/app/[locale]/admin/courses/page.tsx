import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { localePath } from '@/lib/locale';
import { listCoursesWithModules } from '@/lib/courses/getCourseWithModules';

export const dynamic = 'force-dynamic';

/**
 * Admin course listing.
 *
 * Course content now lives in Neon Postgres via Drizzle
 * (see src/lib/courses/getCourseWithModules.ts).
 *
 * Supabase is reserved for Auth/XP/Coins/Streak/SRS/Role only.
 */
export default async function AdminCoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loginPath = localePath(locale, '/login');
  const dashboardPath = localePath(locale, '/dashboard');

  const user = await getCurrentUser();
  if (!user) redirect(loginPath);

  try {
    await requireMinRole('admin_super');
  } catch {
    redirect(dashboardPath);
  }

  const courses = await listCoursesWithModules(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Manage Courses</h1>
          <p className="text-lg text-gray-600">
            {courses.length} course{courses.length === 1 ? '' : 's'} in the catalog
          </p>
        </div>
      </header>

      <div className="grid gap-4">
        {courses.map((course) => {
          const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
          return (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{course.title}</CardTitle>
                      <Badge variant={course.isPublished ? 'success' : 'warning'}>
                        {course.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      {course.price > 0 && (
                        <Badge variant="secondary">{course.price} XP / coins</Badge>
                      )}
                    </div>
                    <CardDescription>{course.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Category: {course.category?.name || 'None'}</span>
                  <span>Difficulty: {course.difficultyLevel || 'Not set'}</span>
                  <span>Slug: {course.slug}</span>
                  <span>{course.modules.length} module{course.modules.length === 1 ? '' : 's'}</span>
                  <span>{lessonCount} lesson{lessonCount === 1 ? '' : 's'}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No courses found.</p>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8 border-dashed">
        <CardContent className="py-6 text-center text-sm text-gray-500">
          Course creation / editing / publish-toggle UI is not built yet — only{' '}
          <code>POST /api/admin/courses</code> and <code>/api/admin/courses/[id]</code> exist
          server-side. This page is read-only until that UI is added.
        </CardContent>
      </Card>
    </div>
  );
}
