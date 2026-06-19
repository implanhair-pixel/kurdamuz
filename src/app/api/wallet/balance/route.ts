import { NextRequest, NextResponse } from 'next/server';
import { walletManager } from '@/lib/wallet/wallet-manager';
import { GetWalletBalanceSchema } from '@/lib/wallet/validation';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/wallet/balance
 * Get current wallet balance for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const validatedData = GetWalletBalanceSchema.parse({ userId: user.id });

    const balance = await walletManager.getBalance(validatedData.userId);

    return NextResponse.json({ balance });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    if (error.message === 'Wallet not found for this user') {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }
    console.error('Error getting wallet balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
