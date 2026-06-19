import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function getDashboardStats() {
  // Fetch stats from the database
  const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/courses?select=count`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
  });

  const lessonsResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/lessons?select=count`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
  });

  const usersResponse = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_progress?select=count`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
  });

  const courses = await coursesResponse.json();
  const lessons = await lessonsResponse.json();
  const users = await usersResponse.json();

  return {
    totalCourses: courses[0]?.count || 0,
    totalLessons: lessons[0]?.count || 0,
    totalUsers: users[0]?.count || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">
          Manage courses, lessons, and track learner progress
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Courses</CardTitle>
            <CardDescription>Published courses in the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{stats.totalCourses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Lessons</CardTitle>
            <CardDescription>Available lessons across all courses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{stats.totalLessons}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Learners</CardTitle>
            <CardDescription>Users with recorded progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/admin/courses" className="block">
              <Button className="w-full">Manage Courses</Button>
            </a>
            <a href="/admin/lessons" className="block">
              <Button variant="outline" className="w-full">Manage Lessons</Button>
            </a>
            <a href="/admin/vocabulary" className="block">
              <Button variant="outline" className="w-full">Manage Vocabulary</Button>
            </a>
            <a href="/admin/grammar" className="block">
              <Button variant="outline" className="w-full">Manage Grammar</Button>
            </a>
            <a href="/admin/progress" className="block">
              <Button variant="outline" className="w-full">View Progress</Button>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest platform activity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Activity tracking coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
