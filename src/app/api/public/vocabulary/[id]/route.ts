import { NextRequest, NextResponse } from 'next/server';
import { getWordById, dialectFromId } from '@/lib/content/reader';

/**
 * Single vocabulary entry by id.
 *
 * IMPORTANT: This reads exclusively from the local /data/<dialect>/words.json
 * files via src/lib/content/reader.ts — there is no database query here.
 * The dialect is resolved from the id's prefix (e.g. "sor-w-001" -> sorani),
 * per the prefix scheme documented in data/FORMAT.md.
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const dialect = dialectFromId(id);

    if (!dialect) {
      return NextResponse.json(
        { error: `Could not determine dialect for id "${id}"` },
        { status: 400 }
      );
    }

    const word = getWordById(dialect, id);

    if (!word) {
      return NextResponse.json(
        { error: 'Vocabulary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ vocabulary: { ...word, dialect } });
  } catch (error) {
    console.error('Vocabulary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
