import { NextRequest, NextResponse } from 'next/server';
import { createResearchCollection, getResearchCollectionsByUser } from '@/lib/dialects/dialect-service';
import type { CreateResearchCollectionRequest } from '@/types/dialects';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';

const createCollectionSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

export async function GET(_request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const collections = await getResearchCollectionsByUser(user.id);
    return NextResponse.json({ collections }, { status: 200 });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCollectionSchema.parse(body);
    const collection = await createResearchCollection(user.id, validatedData as CreateResearchCollectionRequest);
    return NextResponse.json({ collection }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  }
}
