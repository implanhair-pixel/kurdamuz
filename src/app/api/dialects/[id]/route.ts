import { NextRequest, NextResponse } from 'next/server';
import { getDialectById, updateDialect, deleteDialect } from '@/lib/dialects/dialect-service';
import { UpdateDialectRequest } from '@/types/dialects';
import { z } from 'zod';

// Validation schema
const updateDialectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  region: z.string().optional(),
  status: z.enum(['active', 'deprecated', 'experimental']).optional(),
});

// GET /api/dialects/[id] - Get a specific dialect
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const dialect = await getDialectById(id);
    
    if (!dialect) {
      return NextResponse.json(
        { error: 'Dialect not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ dialect }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dialect:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dialect' },
      { status: 500 }
    );
  }
}

// PUT /api/dialects/[id] - Update a dialect
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = updateDialectSchema.parse(body);
    
    const dialect = await updateDialect(id, validatedData as UpdateDialectRequest);
    
    if (!dialect) {
      return NextResponse.json(
        { error: 'Dialect not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ dialect }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error updating dialect:', error);
    return NextResponse.json(
      { error: 'Failed to update dialect' },
      { status: 500 }
    );
  }
}

// DELETE /api/dialects/[id] - Delete a dialect
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const success = await deleteDialect(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Dialect not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting dialect:', error);
    return NextResponse.json(
      { error: 'Failed to delete dialect' },
      { status: 500 }
    );
  }
}
