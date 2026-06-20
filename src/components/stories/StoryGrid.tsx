'use client';

import { StoryCard } from './StoryCard';

interface StoryGridProps {
  stories: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string;
    coverImageUrl?: string;
    estimatedReadingTime?: number;
    difficultyLevel: string;
    isFeatured?: boolean;
  }>;
}

export function StoryGrid({ stories }: StoryGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stories.map((story) => (
        <StoryCard key={story.id} {...story} />
      ))}
    </div>
  );
}
