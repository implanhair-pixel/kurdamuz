import { NextRequest, NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { courses, purchaseRequests } from '@/db/schema';

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [course] = await db.select().from(courses).where(eq(courses.id, id)).limit(1);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    if ((course.price || 0) <= 0) {
      return NextResponse.json({ error: 'Free courses do not need a purchase request' }, { status: 400 });
    }

    const existing = await db
      .select({ id: purchaseRequests.id, status: purchaseRequests.status })
      .from(purchaseRequests)
      .where(and(eq(purchaseRequests.userId, user.id), eq(purchaseRequests.courseId, id)))
      .limit(1);

    if (existing[0]?.status === 'pending') {
      return NextResponse.json({ success: true, pending: true });
    }

    if (existing[0]?.status === 'approved') {
      return NextResponse.json({ success: true, approved: true });
    }

    const [request] = await db.insert(purchaseRequests).values({
      userId: user.id,
      courseId: id,
      amount: course.price,
      status: 'pending',
    }).returning();

    return NextResponse.json({ success: true, request });
  } catch (error) {
    console.error('Purchase request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
