import { NextRequest, NextResponse } from 'next/server';
import { getTags, isDialect } from '@/lib/content/reader';
import { DIALECTS, type Dialect } from '@/types/content';

/**
 * Distinct vocabulary/phrase tags.
 *
 * IMPORTANT: This reads exclusively from the local /data/<dialect>/{words,phrases}.json
 * files via src/lib/content/reader.ts — there is no database query here.
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dialectParam = searchParams.get('dialect');

    let dialectsToSearch: Dialect[];
    if (dialectParam) {
      if (!isDialect(dialectParam)) {
        return NextResponse.json(
          { error: `Invalid dialect "${dialectParam}". Must be one of: ${DIALECTS.join(', ')}` },
          { status: 400 }
        );
      }
      dialectsToSearch = [dialectParam];
    } else {
      dialectsToSearch = DIALECTS;
    }

    const tagSet = new Set<string>();
    dialectsToSearch.forEach((dialect) => {
      getTags(dialect).forEach((t) => tagSet.add(t));
    });

    const tags = Array.from(tagSet)
      .sort()
      .map((name) => ({ name }));

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Tags API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
