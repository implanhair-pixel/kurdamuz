import { NextRequest, NextResponse } from 'next/server';
import { transactionService } from '@/lib/wallet/transaction-service';
import { GetTransactionHistorySchema } from '@/lib/wallet/validation';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/wallet/transactions
 * Get transaction history for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const validatedData = GetTransactionHistorySchema.parse({
      userId: user.id,
      limit,
      offset,
    });

    const transactions = await transactionService.getTransactionHistory(
      validatedData.userId,
      validatedData.limit,
      validatedData.offset
    );

    return NextResponse.json({ transactions });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error getting transaction history:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
