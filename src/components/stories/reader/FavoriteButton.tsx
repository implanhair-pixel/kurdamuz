'use client';

import { Button } from '@/components/ui/button';
import { Heart, HeartOff } from 'lucide-react';
import { useState } from 'react';

export function FavoriteButton() {
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = async () => {
    // TODO: Implement favorite API call
    setIsFavorited(!isFavorited);
  };

  return (
    <Button
      variant={isFavorited ? 'primary' : 'outline'}
      size="sm"
      onClick={handleFavorite}
    >
      {isFavorited ? (
        <Heart className="w-4 h-4 fill-current" />
      ) : (
        <HeartOff className="w-4 h-4" />
      )}
    </Button>
  );
}
