import { NextRequest, NextResponse } from 'next/server';
import { createResearchCollection, getResearchCollectionsByUser } from '@/lib/dialects/dialect-service';
import type { CreateResearchCollectionRequest } from '@/types/dialects';
import { z } from 'zod';

// Validation schema
const createCollectionSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
});

// GET /api/dialects/research/collections - Get user's research collections
export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would get the user ID from the session
    // For now, we'll use a placeholder user ID
    const userId = 'placeholder-user-id';
    
    const collections = await getResearchCollectionsByUser(userId);
    
    return NextResponse.json({ collections }, { status: 200 });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  }
}

// POST /api/dialects/research/collections - Create a new research collection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createCollectionSchema.parse(body);
    
    // In a real implementation, you would get the user ID from the session
    const userId = 'placeholder-user-id';
    
    const collection = await createResearchCollection(userId, validatedData as CreateResearchCollectionRequest);
    
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
