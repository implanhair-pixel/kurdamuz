import { NextRequest, NextResponse } from 'next/server';
import { createProfile, getProfileByUserId, getProfileStats, getUserPosts, getUserComments } from '@/lib/community/profiles';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const stats = searchParams.get('stats') === 'true';
    const posts = searchParams.get('posts') === 'true';
    const comments = searchParams.get('comments') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (stats) {
      const profileStats = await getProfileStats(userId);
      return NextResponse.json(profileStats);
    }

    if (posts) {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const userPosts = await getUserPosts(userId, { page, limit });
      return NextResponse.json({ posts: userPosts });
    }

    if (comments) {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const userComments = await getUserComments(userId, { page, limit });
      return NextResponse.json({ comments: userComments });
    }

    const profile = await getProfileByUserId(userId);

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Profile not found' ? 404 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    
    const body = await request.json();
    
    const profile = await createProfile(body);

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create profile' },
      { status: error.message === 'Unauthorized' || error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
