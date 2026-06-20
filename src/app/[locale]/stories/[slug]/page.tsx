'use client';

import { useParams } from 'next/navigation';
import { StoryReader } from '@/components/stories/reader/StoryReader';
import { StoryHeader } from '@/components/stories/reader/StoryHeader';
import { ReadingProgressBar } from '@/components/stories/reader/ReadingProgressBar';
import { BookmarkButton } from '@/components/stories/reader/BookmarkButton';
import { FavoriteButton } from '@/components/stories/reader/FavoriteButton';

export default function StoryReaderPage() {
  const params = useParams();
  const slug = params?.slug as string;
  return (
    <div className="container mx-auto px-4 py-8">
      <StoryHeader slug={slug} />

      <div className="mb-6">
        <ReadingProgressBar />
      </div>

      <div className="flex justify-end gap-2 mb-6">
        <BookmarkButton storySlug={slug} />
        <FavoriteButton storySlug={slug} />
      </div>

      <StoryReader slug={slug} />
    </div>
  );
}
