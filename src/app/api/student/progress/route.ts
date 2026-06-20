import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { userProgress, lessons, courseModules, courses } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const rows = await db
      .select({
        progress: userProgress,
        lesson: lessons,
        module: courseModules,
        course: courses,
      })
      .from(userProgress)
      .leftJoin(lessons, eq(userProgress.lessonId, lessons.id))
      .leftJoin(courseModules, eq(lessons.moduleId, courseModules.id))
      .leftJoin(courses, eq(courseModules.courseId, courses.id))
      .where(eq(userProgress.userId, user.id));

    const progress = rows.map((r) => ({
      ...r.progress,
      lesson: r.lesson ? { ...r.lesson, module: r.module ? { ...r.module, course: r.course } : null } : null,
    }));

    return NextResponse.json({ progress });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Progress fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { lessonId, status, completionPercentage, score } = body;

    if (!lessonId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: lessonId, status' },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.lessonId, lessonId))
      .limit(1);

    const completedAt = status === 'completed' ? new Date() : null;
    let progress;

    const match = existing.find((p) => p.userId === user.id);
    if (match) {
      [progress] = await db
        .update(userProgress)
        .set({
          status,
          completionPercentage: completionPercentage || 0,
          score,
          completedAt,
        })
        .where(eq(userProgress.id, match.id))
        .returning();
    } else {
      [progress] = await db
        .insert(userProgress)
        .values({
          userId: user.id,
          lessonId,
          status,
          completionPercentage: completionPercentage || 0,
          score,
          completedAt,
        })
        .returning();
    }

    // XP awarding on lesson completion is handled by the existing XP
    // system (src/app/actions/xp.ts / src/app/api/xp) — not duplicated here.

    return NextResponse.json({ progress });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
