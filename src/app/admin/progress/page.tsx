import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

async function getUserProgress() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/user_progress?select=*,lessons(*,course_modules(*,courses(*)))`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user progress');
  }

  const { data: progress } = await response.json();
  return progress;
}

export default async function AdminProgressPage() {
  const progress = await getUserProgress();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Learner Progress</h1>
        <p className="text-lg text-gray-600">
          Track learner progress across all courses and lessons
        </p>
      </header>

      <div className="grid gap-4">
        {progress.map((item: any) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>
                {item.lessons?.course_modules?.courses?.title || 'Unknown Course'}
              </CardTitle>
              <CardDescription>
                Lesson: {item.lessons?.title || 'Unknown Lesson'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className="text-sm text-gray-600 capitalize">{item.status}</span>
                </div>
                <div>
                  <Progress value={item.completion_percentage} label="Completion" />
                </div>
                {item.score !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Score</span>
                    <span className="text-sm text-gray-600">{item.score}%</span>
                  </div>
                )}
                {item.completed_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm text-gray-600">
                      {new Date(item.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {progress.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">No learner progress recorded yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
