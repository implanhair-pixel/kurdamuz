import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { courseEnrollments, courses } from '@/db/schema';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    if ((course.price || 0) > 0) {
      return NextResponse.json({ error: 'Paid courses require a purchase request' }, { status: 400 });
    }

    const existing = await db
      .select({ id: courseEnrollments.id })
      .from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, user.id), eq(courseEnrollments.courseId, id)))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(courseEnrollments).values({ userId: user.id, courseId: id, status: 'active' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Course enroll error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
