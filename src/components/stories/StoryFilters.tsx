'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function StoryFilters() {
  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Difficulty:</span>
        <Button variant="outline" size="sm">All</Button>
        <Button variant="ghost" size="sm">Beginner</Button>
        <Button variant="ghost" size="sm">Intermediate</Button>
        <Button variant="ghost" size="sm">Advanced</Button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Category:</span>
        <Button variant="outline" size="sm">All</Button>
        <Button variant="ghost" size="sm">Folklore</Button>
        <Button variant="ghost" size="sm">History</Button>
        <Button variant="ghost" size="sm">Culture</Button>
      </div>
    </div>
  );
}
