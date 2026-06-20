import { NextRequest, NextResponse } from 'next/server';
import { getXPTransactions, awardXP } from '../../../../lib/xp/xp';
import { getUserLevel } from '../../../../lib/xp/progression';
import { z } from 'zod';

// GET /api/xp/transactions - List XP transactions for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const transactionType = searchParams.get('transactionType');
    const sourceType = searchParams.get('sourceType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const transactions = await getXPTransactions(userId, {
      transactionType: transactionType as any,
      sourceType: sourceType as any,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching XP transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch XP transactions' },
      { status: 500 }
    );
  }
}

// POST /api/xp/transactions - Award XP to a user
const awardXPSchema = z.object({
  userId: z.string().uuid(),
  amount: z.number().int().positive(),
  sourceType: z.enum([
    'lesson_completion',
    'quiz_completion',
    'course_completion',
    'daily_login',
    'streak',
    'achievement',
    'teacher_award',
    'admin_bonus',
    'special_event',
  ]),
  sourceId: z.string().uuid().optional(),
  description: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = awardXPSchema.parse(body);

    const transaction = await awardXP(
      validatedData.userId,
      validatedData.amount,
      validatedData.sourceType,
      validatedData.sourceId,
      validatedData.description
    );

    // Get updated user level
    const userLevel = await getUserLevel(validatedData.userId);

    return NextResponse.json({
      transaction,
      userLevel,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error awarding XP:', error);
    return NextResponse.json(
      { error: 'Failed to award XP' },
      { status: 500 }
    );
  }
}
