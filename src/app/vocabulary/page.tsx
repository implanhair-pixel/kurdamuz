import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

async function getVocabulary() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/vocabulary?select=*`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vocabulary');
  }

  const { data: vocabulary } = await response.json();
  return vocabulary;
}

export default async function VocabularyPage() {
  const vocabulary = await getVocabulary();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Vocabulary</h1>
        <p className="text-lg text-gray-600">
          Browse our comprehensive Kurdish vocabulary database
        </p>
      </header>

      <div className="mb-8">
        <Input
          type="search"
          placeholder="Search vocabulary..."
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
        {vocabulary.map((word: any) => (
          <Card key={word.id}>
            <CardHeader>
              <CardTitle className="text-2xl">{word.kurdish_word}</CardTitle>
              <CardDescription>
                {word.pronunciation && (
                  <span className="text-sm">/{word.pronunciation}/</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Persian: </span>
                  <span className="font-medium">{word.persian_translation}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">English: </span>
                  <span className="font-medium">{word.english_translation}</span>
                </div>
                {word.difficulty_level && (
                  <Badge variant="secondary" className="mt-2">
                    {word.difficulty_level}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vocabulary.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No vocabulary entries found.</p>
        </div>
      )}
    </div>
  );
}
