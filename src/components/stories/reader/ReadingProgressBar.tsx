'use client';

import { Progress } from '@/components/ui/progress';

export function ReadingProgressBar() {
  return (
    <div className="w-full">
      <Progress value={33} className="h-2" />
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>33% complete</span>
        <span>~5 min remaining</span>
      </div>
    </div>
  );
}
