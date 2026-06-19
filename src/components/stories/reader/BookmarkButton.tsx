'use client';

import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState } from 'react';

export function BookmarkButton() {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = async () => {
    // TODO: Implement bookmark API call
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Button
      variant={isBookmarked ? 'primary' : 'outline'}
      size="sm"
      onClick={handleBookmark}
    >
      {isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
    </Button>
  );
}
