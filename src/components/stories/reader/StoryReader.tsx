'use client';

import { useEffect, useState } from 'react';

interface StoryReaderProps {
  slug: string;
}

export function StoryReader({ slug }: StoryReaderProps) {
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
    return <div>Loading story...</div>;
  }

  if (!story) {
    return <div>Story not found</div>;
  }

  return (
    <div className="prose prose-lg max-w-none">
      <div className="whitespace-pre-wrap">{story.content}</div>
    </div>
  );
}
