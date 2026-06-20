import { NextRequest, NextResponse } from 'next/server';
import { desc, eq } from 'drizzle-orm';
import { requireMinRole } from '@/lib/auth';
import { db } from '@/db';
import { courses, purchaseRequests } from '@/db/schema';

export async function GET(_request: NextRequest) {
  try {
    await requireMinRole('admin_super');

    const rows = await db
      .select({
        id: purchaseRequests.id,
        userId: purchaseRequests.userId,
        courseId: purchaseRequests.courseId,
        amount: purchaseRequests.amount,
        status: purchaseRequests.status,
        requestedAt: purchaseRequests.requestedAt,
        reviewedAt: purchaseRequests.reviewedAt,
        reviewedBy: purchaseRequests.reviewedBy,
        courseTitle: courses.title,
      })
      .from(purchaseRequests)
      .leftJoin(courses, eq(purchaseRequests.courseId, courses.id))
      .orderBy(desc(purchaseRequests.requestedAt));

    return NextResponse.json({ purchaseRequests: rows });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Purchase requests fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
