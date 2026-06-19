import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

async function getCourses() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/courses?select=*,categories(*)`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }

  const { data: courses } = await response.json();
  return courses;
}

export default async function AdminCoursesPage() {
  const courses = await getCourses();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Manage Courses</h1>
          <p className="text-lg text-gray-600">
            Create, edit, and publish courses
          </p>
        </div>
        <Button>Create New Course</Button>
      </header>

      <div className="grid gap-4">
        {courses.map((course: any) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle>{course.title}</CardTitle>
                    <Badge variant={course.is_published ? 'success' : 'warning'}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    {course.is_published ? 'Unpublish' : 'Publish'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Category: {course.categories?.name || 'None'}</span>
                <span>Difficulty: {course.difficulty_level || 'Not set'}</span>
                <span>Slug: {course.slug}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600 mb-4">No courses found.</p>
            <Button>Create Your First Course</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
