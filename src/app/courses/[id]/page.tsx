import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

async function getCourse(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/courses?id=eq.${id}&is_published=eq.true&select=*,categories(*),course_modules(*,lessons(*))`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch course');
  }

  const { data: courses } = await response.json();
  return courses[0];
}

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const course = await getCourse(id);

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Course not found</h1>
      </div>
    );
  }

  const totalLessons = course.course_modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{course.categories?.name}</Badge>
          <Badge variant={course.difficulty_level === 'beginner' ? 'success' : 'warning'}>
            {course.difficulty_level}
          </Badge>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
        <p className="text-lg text-gray-600 mb-4">{course.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{course.course_modules?.length || 0} modules</span>
          <span>{totalLessons} lessons</span>
        </div>
      </header>

      <div className="mb-8">
        <Button size="lg" className="w-full md:w-auto">
          Start Learning
        </Button>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
        {course.course_modules?.map((module: any, moduleIndex: number) => (
          <Card key={module.id}>
            <CardHeader>
              <CardTitle>
                Module {moduleIndex + 1}: {module.title}
              </CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {module.lessons?.map((lesson: any, lessonIndex: number) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        Lesson {lessonIndex + 1}: {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-600">{lesson.lesson_type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">{lesson.xp_reward} XP</Badge>
                      <span className="text-sm text-gray-600">{lesson.estimated_duration} min</span>
                      <Button variant="outline" size="sm">
                        Start
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
