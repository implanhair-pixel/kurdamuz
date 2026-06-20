import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { stories, storyProgress, storyCompletions } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/student/stories/history - Reading history
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get stories with progress
    const history = await db
      .select({
        id: stories.id,
        title: stories.title,
        slug: stories.slug,
        summary: stories.summary,
        coverImageUrl: stories.coverImageUrl,
        difficultyLevel: stories.difficultyLevel,
        completionPercentage: storyProgress.completionPercentage,
        lastReadAt: storyProgress.lastReadAt,
        startedAt: storyProgress.startedAt,
        completedAt: storyProgress.completedAt,
      })
      .from(storyProgress)
      .innerJoin(stories, eq(storyProgress.storyId, stories.id))
      .where(eq(storyProgress.userId, user.id))
      .orderBy(desc(storyProgress.lastReadAt))
      .limit(limit);

    return NextResponse.json(history);
  } catch (error) {
    console.error('Error fetching reading history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reading history' },
      { status: 500 }
    );
  }
}
