import { NextRequest, NextResponse } from 'next/server';
import { policyService } from '@/lib/wallet/policy-service';
import { UpsertPolicySchema, GetPolicySchema, DeactivatePolicySchema, ActivatePolicySchema, DeletePolicySchema } from '@/lib/wallet/validation';
import { getCurrentUser, requireRole } from '@/lib/auth';

/**
 * GET /api/wallet/policies
 * Get all coin economy policies (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole('admin');
    
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');

    if (eventType) {
      const validatedData = GetPolicySchema.parse({ eventType });
      const policy = await policyService.getPolicy(validatedData.eventType);
      
      if (!policy) {
        return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
      }
      
      return NextResponse.json({ policy });
    }

    const policies = await policyService.getAllPolicies();
    return NextResponse.json({ policies });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error getting policies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/wallet/policies
 * Create or update a coin economy policy (admin only)
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await requireRole('admin');
    
    const body = await request.json();
    const validatedData = UpsertPolicySchema.parse({
      ...body,
      actorId: user.id,
    });

    const policy = await policyService.upsertPolicy(
      validatedData.eventType,
      validatedData.coinReward,
      validatedData.xpReward,
      validatedData.isActive,
      validatedData.actorId
    );

    return NextResponse.json({ policy });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error upserting policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/wallet/policies
 * Activate or deactivate a policy (admin only)
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await requireRole('admin');
    
    const body = await request.json();
    const { eventType, action } = body;

    if (action === 'deactivate') {
      const validatedData = DeactivatePolicySchema.parse({ eventType });
      await policyService.deactivatePolicy(validatedData.eventType);
    } else if (action === 'activate') {
      const validatedData = ActivatePolicySchema.parse({ eventType });
      await policyService.activatePolicy(validatedData.eventType);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error updating policy status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/wallet/policies
 * Delete a policy (admin only)
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireRole('admin');
    
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');

    if (!eventType) {
      return NextResponse.json({ error: 'eventType is required' }, { status: 400 });
    }

    const validatedData = DeletePolicySchema.parse({ eventType });
    await policyService.deletePolicy(validatedData.eventType);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    console.error('Error deleting policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
