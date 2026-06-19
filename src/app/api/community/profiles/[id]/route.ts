import { NextRequest, NextResponse } from 'next/server';
import { getProfileById, updateProfile } from '@/lib/community/profiles';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await requireAuth();
    
    const profile = await getProfileById(id);

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch profile' },
      { status: error.message === 'Unauthorized' ? 401 : error.message === 'Profile not found' ? 404 : 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await requireAuth();
    
    const body = await request.json();
    
    const profile = await updateProfile(id, body);

    return NextResponse.json({ profile });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: error.message === 'Unauthorized' ? 401 : error.message.includes('Forbidden') ? 403 : 500 }
    );
  }
}
