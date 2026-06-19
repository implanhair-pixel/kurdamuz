'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CourseCard } from '@/components/ui/course-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

async function getCourses() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/courses?is_published=eq.true&select=*,categories(*),course_modules(*,lessons(*))`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }

  const { data: courses } = await response.json();
  return courses;
}

export default function CoursesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses().then((data) => {
      setCourses(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading courses...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Courses</h1>
        <p className="text-lg text-gray-600">
          Explore our Kurdish language courses and start your learning journey
        </p>
      </header>

      <div className="mb-8 flex flex-wrap gap-2">
        <Badge variant="default">All</Badge>
        <Badge variant="secondary">Beginner</Badge>
        <Badge variant="secondary">Elementary</Badge>
        <Badge variant="secondary">Intermediate</Badge>
        <Badge variant="secondary">Advanced</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course: any) => (
          <Link key={course.id} href={`/${locale}/courses/${course.id}`} className="block">
            <CourseCard
              id={course.id}
              title={course.title}
              description={course.description}
              thumbnailUrl={course.thumbnail_url}
              difficultyLevel={course.difficulty_level}
              category={course.categories?.name}
              moduleCount={course.course_modules?.length || 0}
              lessonCount={course.course_modules?.reduce((acc: number, mod: any) => acc + (mod.lessons?.length || 0), 0) || 0}
              isPublished={course.is_published}
              onView={() => {}}
            />
          </Link>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No courses available at the moment.</p>
          <Button>Check back later</Button>
        </div>
      )}
    </div>
  );
}
