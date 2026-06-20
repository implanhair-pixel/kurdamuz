'use client';

import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface BookmarkButtonProps {
  storySlug: string;
}

export function BookmarkButton({ storySlug }: BookmarkButtonProps) {
  const [storyId, setStoryId] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      try {
        const storyRes = await fetch(`/api/public/stories/${storySlug}`);
        if (!storyRes.ok) {
          throw new Error('Story not found');
        }

        const story = await storyRes.json();
        if (cancelled) return;

        setStoryId(story.id);

        const bookmarkRes = await fetch(`/api/student/stories/bookmark?storyId=${story.id}`);
        if (bookmarkRes.ok) {
          const bookmark = await bookmarkRes.json();
          setIsBookmarked(Boolean(bookmark));
        }
      } catch (error) {
        console.error('Error loading bookmark state:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadState();
    return () => {
      cancelled = true;
    };
  }, [storySlug]);

  const label = useMemo(() => (isBookmarked ? 'Remove bookmark' : 'Bookmark'), [isBookmarked]);

  const handleBookmark = async () => {
    if (!storyId || busy) {
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/student/stories/bookmark', {
        method: isBookmarked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, bookmarkPosition: 0 }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bookmark');
      }

      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error updating bookmark:', error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={isBookmarked ? 'primary' : 'outline'}
      size="sm"
      onClick={handleBookmark}
      disabled={loading || busy || !storyId}
      aria-label={label}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </Button>
  );
}
