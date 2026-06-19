import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { communityPosts, communityComments, communityProfiles } from '@/db/schema';
import { or, ilike, desc, and, eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { searchSchema } from '@/lib/community/validations';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query');
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json(
        { error: 'query is required' },
        { status: 400 }
      );
    }

    const validated = searchSchema.parse({
      query,
      type,
      page,
      limit,
    });

    const offset = (validated.page - 1) * validated.limit;
    const results: any = {
      posts: [],
      comments: [],
      users: [],
    };

    if (validated.type === 'all' || validated.type === 'posts') {
      const posts = await db
        .select()
        .from(communityPosts)
        .where(and(
          eq(communityPosts.status, 'published'),
          or(
            ilike(communityPosts.title, `%${validated.query}%`),
            ilike(communityPosts.content, `%${validated.query}%`)
          )
        ))
        .orderBy(desc(communityPosts.createdAt))
        .limit(validated.limit)
        .offset(offset);

      results.posts = posts;
    }

    if (validated.type === 'all' || validated.type === 'comments') {
      const comments = await db
        .select()
        .from(communityComments)
        .where(and(
          eq(communityComments.status, 'published'),
          ilike(communityComments.content, `%${validated.query}%`)
        ))
        .orderBy(desc(communityComments.createdAt))
        .limit(validated.limit)
        .offset(offset);

      results.comments = comments;
    }

    if (validated.type === 'all' || validated.type === 'users') {
      const users = await db
        .select()
        .from(communityProfiles)
        .where(
          ilike(communityProfiles.displayName, `%${validated.query}%`)
        )
        .orderBy(desc(communityProfiles.reputationScore))
        .limit(validated.limit)
        .offset(offset);

      results.users = users;
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search' },
      { status: error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}
