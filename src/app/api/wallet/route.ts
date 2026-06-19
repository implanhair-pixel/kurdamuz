import { NextRequest, NextResponse } from 'next/server';
import { walletManager } from '@/lib/wallet/wallet-manager';
import { CreateWalletSchema, GetWalletBalanceSchema } from '@/lib/wallet/validation';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/wallet
 * Get wallet balance for authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const validatedData = GetWalletBalanceSchema.parse({ userId });

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

/**
 * POST /api/wallet
 * Create a new wallet for authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const actorId = user.id;

    const validatedData = CreateWalletSchema.parse({ userId });

    const walletId = await walletManager.createWallet(
      validatedData.userId,
      actorId
    );

    return NextResponse.json({ walletId }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    if (error.message === 'Wallet already exists for this user') {
      return NextResponse.json({ error: 'Wallet already exists' }, { status: 409 });
    }
    console.error('Error creating wallet:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
