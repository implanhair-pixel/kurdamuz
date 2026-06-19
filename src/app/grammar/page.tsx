import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

async function getGrammarTopics() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/grammar_topics?select=*`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch grammar topics');
  }

  const { data: grammarTopics } = await response.json();
  return grammarTopics;
}

export default async function GrammarPage() {
  const grammarTopics = await getGrammarTopics();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Grammar</h1>
        <p className="text-lg text-gray-600">
          Learn Kurdish grammar rules and structures
        </p>
      </header>

      <div className="mb-8">
        <Input
          type="search"
          placeholder="Search grammar topics..."
          className="max-w-md"
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <Badge variant="default">All</Badge>
        <Badge variant="secondary">Beginner</Badge>
        <Badge variant="secondary">Elementary</Badge>
        <Badge variant="secondary">Intermediate</Badge>
        <Badge variant="secondary">Advanced</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {grammarTopics.map((topic: any) => (
          <Card key={topic.id}>
            <CardHeader>
              <CardTitle>{topic.title}</CardTitle>
              <CardDescription>{topic.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {topic.difficulty_level && (
                <Badge variant={topic.difficulty_level === 'beginner' ? 'success' : 'warning'}>
                  {topic.difficulty_level}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {grammarTopics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No grammar topics found.</p>
        </div>
      )}
    </div>
  );
}
