import { NextRequest, NextResponse } from 'next/server';
import { getResearchCollectionById, updateResearchCollection, deleteResearchCollection } from '@/lib/dialects/dialect-service';
import type { CreateResearchCollectionRequest } from '@/types/dialects';
import { z } from 'zod';

// Validation schema
const updateCollectionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
});

// GET /api/dialects/research/collections/[id] - Get a specific collection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const collection = await getResearchCollectionById(id);
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ collection }, { status: 200 });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

// PUT /api/dialects/research/collections/[id] - Update a collection
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = updateCollectionSchema.parse(body);
    
    const collection = await updateResearchCollection(id, validatedData as Partial<CreateResearchCollectionRequest>);
    
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ collection }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Failed to update collection' },
      { status: 500 }
    );
  }
}

// DELETE /api/dialects/research/collections/[id] - Delete a collection
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const success = await deleteResearchCollection(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
