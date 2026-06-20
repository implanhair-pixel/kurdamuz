import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  difficultyLevel?: string;
  category?: string;
  moduleCount?: number;
  lessonCount?: number;
  isPublished?: boolean;
  onEnroll?: () => void;
  onView?: () => void;
  className?: string;
}

export function CourseCard({
  title,
  description,
  thumbnailUrl,
  difficultyLevel,
  category,
  moduleCount = 0,
  lessonCount = 0,
  isPublished = true,
  onEnroll,
  onView,
  className,
}: CourseCardProps) {
  return (
    <Card className={cn('overflow-hidden transition-shadow hover:shadow-lg', className)}>
      {thumbnailUrl && (
        <div className="aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {category && (
              <Badge variant="secondary" className="mb-2">
                {category}
              </Badge>
            )}
            <CardTitle className="line-clamp-2">{title}</CardTitle>
          </div>
          {difficultyLevel && (
            <Badge variant={difficultyLevel === 'beginner' ? 'success' : 'warning'}>
              {difficultyLevel}
            </Badge>
          )}
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span aria-label={`${moduleCount} modules`}>
            {moduleCount} {moduleCount === 1 ? 'module' : 'modules'}
          </span>
          <span aria-label={`${lessonCount} lessons`}>
            {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {onView && (
          <Button variant="outline" className="flex-1" onClick={onView}>
            View Details
          </Button>
        )}
        {onEnroll && isPublished && (
          <Button className="flex-1" onClick={onEnroll}>
            Enroll
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
