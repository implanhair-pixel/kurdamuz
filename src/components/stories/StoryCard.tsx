'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen } from 'lucide-react';

interface StoryCardProps {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImageUrl?: string;
  estimatedReadingTime?: number;
  difficultyLevel: string;
  isFeatured?: boolean;
}

export function StoryCard({
  id,
  title,
  slug,
  summary,
  coverImageUrl,
  estimatedReadingTime,
  difficultyLevel,
  isFeatured,
}: StoryCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {coverImageUrl && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={coverImageUrl}
            alt={title}
            className="object-cover w-full h-full"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant={difficultyLevel === 'beginner' ? 'success' : difficultyLevel === 'intermediate' ? 'warning' : 'danger'}>
            {difficultyLevel}
          </Badge>
          {isFeatured && <Badge variant="secondary">Featured</Badge>}
        </div>
        <h3 className="text-xl font-bold line-clamp-2">{title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-3">{summary}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {estimatedReadingTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{estimatedReadingTime} min</span>
            </div>
          )}
        </div>
        <Button size="sm">
          <BookOpen className="w-4 h-4 mr-2" />
          Read
        </Button>
      </CardFooter>
    </Card>
  );
}
