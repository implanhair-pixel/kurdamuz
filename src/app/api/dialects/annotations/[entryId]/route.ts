import { NextRequest, NextResponse } from 'next/server';
import { createLinguisticAnnotation, getLinguisticAnnotationsByEntry, updateLinguisticAnnotation, deleteLinguisticAnnotation } from '@/lib/dialects/dialect-service';
import type { CreateLinguisticAnnotationRequest } from '@/types/dialects';
import { z } from 'zod';

// Validation schema
const createAnnotationSchema = z.object({
  annotationType: z.enum(['morphological', 'phonological', 'syntactic', 'semantic', 'dialect', 'historical', 'usage', 'research']),
  annotationData: z.record(z.any()),
});

// GET /api/dialects/annotations/[entryId] - Get annotations for an entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const { entryId } = await params;
  try {
    const annotations = await getLinguisticAnnotationsByEntry(entryId);
    
    return NextResponse.json({ annotations }, { status: 200 });
  } catch (error) {
    console.error('Error fetching annotations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch annotations' },
      { status: 500 }
    );
  }
}

// POST /api/dialects/annotations/[entryId] - Create a new annotation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const { entryId } = await params;
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createAnnotationSchema.parse(body);
    
    const annotation = await createLinguisticAnnotation({
      entryId: entryId,
      ...validatedData,
    });
    
    return NextResponse.json({ annotation }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    );
  }
}
