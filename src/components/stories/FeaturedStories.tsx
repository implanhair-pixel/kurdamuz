'use client';

import { StoryCard } from './StoryCard';
import { useEffect, useState } from 'react';

export function FeaturedStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/public/stories/featured')
      .then((res) => res.json())
      .then((data) => {
        setStories(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching featured stories:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading featured stories...</div>;
  }

  if (!stories.length) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Featured Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <StoryCard key={story.id} {...story} />
        ))}
      </div>
    </div>
  );
}
