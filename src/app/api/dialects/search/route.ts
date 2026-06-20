import { NextRequest, NextResponse } from 'next/server';
import { dialectSearchService } from '@/lib/search/dialect-search';
import { dialectFilterService } from '@/lib/filters/dialect-filters';
import type { DialectSearchParams } from '@/types/dialects';
import { z } from 'zod';

// Validation schema
const searchParamsSchema = z.object({
  query: z.string().optional(),
  dialectIds: z.array(z.string()).optional(),
  regions: z.array(z.string()).optional(),
  partsOfSpeech: z.array(z.string()).optional(),
  semanticDomains: z.array(z.string()).optional(),
  difficultyLevels: z.array(z.string()).optional(),
  usageFrequencies: z.array(z.string()).optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
});

// POST /api/dialects/search - Search lexical entries
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = searchParamsSchema.parse(body);
    
    // Validate filter parameters
    const validation = dialectFilterService.validateFilterParams(validatedData as DialectSearchParams);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: validation.errors },
        { status: 400 }
      );
    }
    
    // Perform search
    const results = await dialectSearchService.searchLexicalEntries(validatedData as DialectSearchParams);
    
    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error searching lexical entries:', error);
    return NextResponse.json(
      { error: 'Failed to search lexical entries' },
      { status: 500 }
    );
  }
}
