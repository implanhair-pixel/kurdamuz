import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getUserCertificates } from '@/lib/progression';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const certificates = await getUserCertificates(user.id);

    return NextResponse.json({ certificates });
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    console.error('Certificates fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
