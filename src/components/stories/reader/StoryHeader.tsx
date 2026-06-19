'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen } from 'lucide-react';

interface StoryHeaderProps {
  slug: string;
}

export function StoryHeader({ slug }: StoryHeaderProps) {
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/public/stories/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setStory(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching story:', error);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!story) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant={story.difficultyLevel === 'beginner' ? 'success' : story.difficultyLevel === 'intermediate' ? 'warning' : 'danger'}>
          {story.difficultyLevel}
        </Badge>
        {story.categories?.map((category: any) => (
          <Badge key={category.id} variant="secondary">{category.name}</Badge>
        ))}
      </div>
      <h1 className="text-4xl font-bold mb-4">{story.title}</h1>
      <p className="text-muted-foreground text-lg mb-4">{story.summary}</p>
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {story.estimatedReadingTime && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{story.estimatedReadingTime} min read</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>Published {new Date(story.publishedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
