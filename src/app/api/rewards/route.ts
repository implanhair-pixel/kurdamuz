import { NextRequest, NextResponse } from 'next/server';
import { getRewards, createReward } from '../../../lib/xp/rewards';
import { z } from 'zod';

// GET /api/rewards - List all rewards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rewardType = searchParams.get('rewardType');
    const requiredLevel = searchParams.get('requiredLevel');
    const requiredXP = searchParams.get('requiredXP');
    const active = searchParams.get('active');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const rewards = await getRewards({
      rewardType: rewardType as any,
      requiredLevel: requiredLevel ? parseInt(requiredLevel) : undefined,
      requiredXP: requiredXP ? parseInt(requiredXP) : undefined,
      active: active ? active === 'true' : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

// POST /api/rewards - Create a new reward (admin only)
const createRewardSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  rewardType: z.enum([
    'badge',
    'certificate',
    'avatar_item',
    'profile_decoration',
    'course_unlock',
    'special_content',
    'event_access',
  ]),
  requiredLevel: z.number().int().min(1),
  requiredXP: z.number().int().min(0),
  active: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createRewardSchema.parse(body);

    // TODO: Add RBAC check for admin role
    const actorId = body.actorId || 'system'; // Should come from auth

    const reward = await createReward(validatedData, actorId);

    return NextResponse.json({ reward }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    );
  }
}
