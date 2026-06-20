'use client';

import { Button } from '@/components/ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface FavoriteButtonProps {
  storySlug: string;
}

export function FavoriteButton({ storySlug }: FavoriteButtonProps) {
  const [storyId, setStoryId] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
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

        const favoritesRes = await fetch('/api/student/stories/favorites?limit=500');
        if (favoritesRes.ok) {
          const favorites = await favoritesRes.json();
          const matched = Array.isArray(favorites) && favorites.some((item: any) => item.id === story.id);
          setIsFavorited(Boolean(matched));
        }
      } catch (error) {
        console.error('Error loading favorite state:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadState();
    return () => {
      cancelled = true;
    };
  }, [storySlug]);

  const label = useMemo(() => (isFavorited ? 'Unfavorite' : 'Favorite'), [isFavorited]);

  const handleFavorite = async () => {
    if (!storyId || busy) {
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/student/stories/favorite', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error('Error updating favorite:', error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={isFavorited ? 'primary' : 'outline'}
      size="sm"
      onClick={handleFavorite}
      disabled={loading || busy || !storyId}
      aria-label={label}
    >
      {isFavorited ? (
        <Heart className="w-4 h-4 fill-current" />
      ) : (
        <HeartOff className="w-4 h-4" />
      )}
    </Button>
  );
}
