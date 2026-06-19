'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Bookmark, Volume2 } from 'lucide-react';

interface VocabularyCardProps {
  vocabulary: {
    id: string;
    kurdishWord: string;
    persianTranslation: string;
    englishTranslation?: string;
    pronunciation?: string;
    difficultyLevel?: string;
    dialects?: Array<{ dialect: { name: string; code: string } }>;
    tags?: Array<{ tag: { name: string; slug: string } }>;
  };
  isSaved?: boolean;
  isFavorite?: boolean;
  onSave?: () => void;
  onFavorite?: () => void;
  onPlayAudio?: () => void;
}

export function VocabularyCard({
  vocabulary,
  isSaved = false,
  isFavorite = false,
  onSave,
  onFavorite,
  onPlayAudio,
}: VocabularyCardProps) {
  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800',
    elementary: 'bg-blue-100 text-blue-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-right mb-1" dir="rtl">
              {vocabulary.kurdishWord}
            </h3>
            {vocabulary.pronunciation && (
              <p className="text-sm text-gray-600 mb-2">
                {vocabulary.pronunciation}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            {vocabulary.pronunciation && onPlayAudio && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPlayAudio}
                className="h-8 w-8 p-0"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              className={`h-8 w-8 p-0 ${isSaved ? 'text-blue-600' : ''}`}
            >
              <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFavorite}
              className={`h-8 w-8 p-0 ${isFavorite ? 'text-red-600' : ''}`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg" dir="rtl">{vocabulary.persianTranslation}</span>
            {vocabulary.englishTranslation && (
              <span className="text-gray-600">({vocabulary.englishTranslation})</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {vocabulary.difficultyLevel && (
              <Badge className={difficultyColors[vocabulary.difficultyLevel] || ''}>
                {vocabulary.difficultyLevel}
              </Badge>
            )}
            {vocabulary.dialects?.map((d) => (
              <Badge key={d.dialect.code} variant="default">
                {d.dialect.name}
              </Badge>
            ))}
            {vocabulary.tags?.map((t) => (
              <Badge key={t.tag.slug} variant="secondary">
                {t.tag.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
