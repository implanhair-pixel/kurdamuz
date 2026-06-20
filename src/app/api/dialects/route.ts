import { NextRequest, NextResponse } from 'next/server';
import { createDialect, getAllDialects, getActiveDialects } from '@/lib/dialects/dialect-service';
import { CreateDialectRequest } from '@/types/dialects';
import { z } from 'zod';

// Validation schema
const createDialectSchema = z.object({
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/),
  description: z.string().optional(),
  region: z.string().optional(),
  status: z.enum(['active', 'deprecated', 'experimental']).optional(),
});

// GET /api/dialects - List all dialects
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let dialects;
    if (status === 'active') {
      dialects = await getActiveDialects();
    } else {
      dialects = await getAllDialects();
    }

    return NextResponse.json({ dialects }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dialects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dialects' },
      { status: 500 }
    );
  }
}

// POST /api/dialects - Create a new dialect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createDialectSchema.parse(body);
    
    const dialect = await createDialect(validatedData as CreateDialectRequest);
    
    return NextResponse.json({ dialect }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating dialect:', error);
    return NextResponse.json(
      { error: 'Failed to create dialect' },
      { status: 500 }
    );
  }
}
