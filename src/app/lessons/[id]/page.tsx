import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

async function getLesson(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/lessons?id=eq.${id}&select=*,course_modules(*,courses(*)),lesson_assets(*),lesson_vocabulary(*,vocabulary(*)),lesson_grammar(*,grammar_topics(*))`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch lesson');
  }

  const { data: lessons } = await response.json();
  return lessons[0];
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await getLesson(id);

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Lesson not found</h1>
      </div>
    );
  }

  const content = typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content;

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary">{lesson.lesson_type}</Badge>
          <Badge variant="primary">{lesson.xp_reward} XP</Badge>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{lesson.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{lesson.estimated_duration} minutes</span>
          <span>Module: {lesson.course_modules?.title}</span>
          <span>Course: {lesson.course_modules?.courses?.title}</span>
        </div>
      </header>

      <div className="mb-8">
        <Progress value={0} label="Lesson Progress" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Lesson Content</CardTitle>
            </CardHeader>
            <CardContent>
              {lesson.lesson_type === 'reading' && content.sections && (
                <div className="space-y-6">
                  {content.sections.map((section: any, index: number) => (
                    <div key={index}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{section.title}</h3>
                      <p className="text-gray-700">{section.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {lesson.lesson_type === 'vocabulary' && content.words && (
                <div className="grid gap-4 md:grid-cols-2">
                  {content.words.map((word: any, index: number) => (
                    <Card key={index} variant="elevated">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{word.kurdish}</h3>
                        <p className="text-gray-600 mb-1">{word.persian}</p>
                        <p className="text-gray-500">{word.english}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {lesson.lesson_type === 'grammar' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{content.topic}</h3>
                  </div>
                  {content.examples && (
                    <div className="space-y-3">
                      {content.examples.map((example: any, index: number) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-lg font-medium text-gray-900 mb-1">{example.kurdish}</p>
                          <p className="text-gray-600 mb-1">{example.persian}</p>
                          <p className="text-gray-500">{example.english}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {lesson.lesson_assets && lesson.lesson_assets.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Lesson Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lesson.lesson_assets.map((asset: any) => (
                    <div key={asset.id}>
                      <a
                        href={asset.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {asset.title || asset.asset_type}
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">Mark as Complete</Button>
              <Button variant="outline" className="w-full">
                Next Lesson
              </Button>
              <Button variant="ghost" className="w-full">
                Previous Lesson
              </Button>
            </CardContent>
          </Card>

          {lesson.lesson_vocabulary && lesson.lesson_vocabulary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Vocabulary</CardTitle>
                <CardDescription>
                  {lesson.lesson_vocabulary.length} words in this lesson
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lesson.lesson_vocabulary.map((lv: any) => (
                    <div key={lv.id} className="text-sm">
                      <span className="font-medium">{lv.vocabulary.kurdish_word}</span>
                      <span className="text-gray-600 ml-2">{lv.vocabulary.persian_translation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {lesson.lesson_grammar && lesson.lesson_grammar.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Grammar Topics</CardTitle>
                <CardDescription>
                  {lesson.lesson_grammar.length} topics covered
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lesson.lesson_grammar.map((lg: any) => (
                    <Badge key={lg.id} variant="secondary">
                      {lg.grammar_topic.title}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
