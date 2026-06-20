import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { courseEnrollments, purchaseRequests } from '@/db/schema';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [enrollments, requests] = await Promise.all([
      db.select({ courseId: courseEnrollments.courseId }).from(courseEnrollments).where(eq(courseEnrollments.userId, user.id)),
      db.select({ courseId: purchaseRequests.courseId, status: purchaseRequests.status }).from(purchaseRequests).where(eq(purchaseRequests.userId, user.id)),
    ]);

    return NextResponse.json({
      enrolledCourseIds: enrollments.map((row) => row.courseId),
      pendingPurchaseCourseIds: requests.filter((row) => row.status === 'pending').map((row) => row.courseId),
      approvedPurchaseCourseIds: requests.filter((row) => row.status === 'approved').map((row) => row.courseId),
    });
  } catch (error) {
    console.error('Course status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
