import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { 
  createRecoveryRequest, 
  getUserRecoveryRequests 
} from '@/lib/streaks';
import type { CreateRecoveryRequestInput } from '@/types/streak';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const input: CreateRecoveryRequestInput = {
      userId: user.id,
      missedDate: new Date(body.missedDate),
      recoveryType: body.recoveryType,
      reason: body.reason,
    };

    const recoveryRequest = await createRecoveryRequest(input);

    return NextResponse.json(recoveryRequest);
  } catch (error: any) {
    console.error('Error creating recovery request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create recovery request' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any;

    const recoveryRequests = await getUserRecoveryRequests(user.id, status);

    return NextResponse.json(recoveryRequests);
  } catch (error) {
    console.error('Error fetching recovery requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recovery requests' },
      { status: 500 }
    );
  }
}
