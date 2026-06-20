import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, requireMinRole } from '@/lib/auth';
import { getRewards, createReward } from '@/lib/xp/rewards';
import type { RewardFilter, RewardType } from '@/types/xp';

const rewardTypeValues = [
  'badge',
  'certificate',
  'avatar_item',
  'profile_decoration',
  'course_unlock',
  'special_content',
  'event_access',
] as const satisfies readonly RewardType[];

const rewardTypeSchema = z.enum(rewardTypeValues);

const rewardFilterSchema = z.object({
  rewardType: rewardTypeSchema.optional(),
  requiredLevel: z.coerce.number().int().min(1).optional(),
  requiredXP: z.coerce.number().int().min(0).optional(),
  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  offset: z.coerce.number().int().nonnegative().optional(),
});

// GET /api/rewards - List all rewards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = rewardFilterSchema.safeParse({
      rewardType: searchParams.get('rewardType') ?? undefined,
      requiredLevel: searchParams.get('requiredLevel') ?? undefined,
      requiredXP: searchParams.get('requiredXP') ?? undefined,
      active: searchParams.get('active') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid reward filters', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const rewards = await getRewards(parsed.data as RewardFilter);
    return NextResponse.json({ rewards });
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rewards' },
      { status: 500 }
    );
  }
}

const createRewardSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  rewardType: rewardTypeSchema,
  requiredLevel: z.number().int().min(1),
  requiredXP: z.number().int().min(0),
  active: z.boolean().optional(),
});

// POST /api/rewards - Create a new reward (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await requireMinRole('admin_super');

    const body = await request.json();
    const validatedData = createRewardSchema.parse(body);

    const reward = await createReward(validatedData, user.id);
    return NextResponse.json({ reward }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    console.error('Error creating reward:', error);
    return NextResponse.json(
      { error: 'Failed to create reward' },
      { status: 500 }
    );
  }
}
