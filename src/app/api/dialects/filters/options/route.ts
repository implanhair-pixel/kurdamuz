import { NextRequest, NextResponse } from 'next/server';
import { dialectFilterService } from '@/lib/filters/dialect-filters';

// GET /api/dialects/filters/options - Get available filter options
export async function GET(request: NextRequest) {
  try {
    const filterOptions = await dialectFilterService.getFilterOptions();
    
    return NextResponse.json(filterOptions, { status: 200 });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
