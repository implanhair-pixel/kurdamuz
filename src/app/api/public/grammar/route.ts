import { NextRequest, NextResponse } from 'next/server';
import { getGrammar, isDialect } from '@/lib/content/reader';
import { DIALECTS, type Dialect, type GrammarEntry } from '@/types/content';

/**
 * Public grammar topic listing.
 *
 * IMPORTANT: This reads exclusively from the local /data/<dialect>/grammar.json
 * files via src/lib/content/reader.ts — there is no database query here.
 * See data/FORMAT.md for the file format.
 */

function matchesQuery(entry: GrammarEntry, query: string): boolean {
  const q = query.toLowerCase();
  return (
    entry.title.toLowerCase().includes(q) ||
    (entry.titleEn?.toLowerCase().includes(q) ?? false) ||
    entry.explanation.persian.toLowerCase().includes(q) ||
    (entry.explanation.english?.toLowerCase().includes(q) ?? false)
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get('query')?.trim();
    const category = searchParams.get('category') || undefined;
    const difficultyParam = searchParams.get('difficulty');
    const difficulty = difficultyParam ? parseInt(difficultyParam, 10) : undefined;

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

    let topics: (GrammarEntry & { dialect: Dialect })[] = dialectsToSearch.flatMap((dialect) =>
      getGrammar(dialect).map((g) => ({ ...g, dialect }))
    );

    if (query) {
      topics = topics.filter((g) => matchesQuery(g, query));
    }

    if (category) {
      topics = topics.filter((g) => g.category === category);
    }

    if (typeof difficulty === 'number' && !Number.isNaN(difficulty)) {
      topics = topics.filter((g) => g.difficulty === difficulty);
    }

    return NextResponse.json({ grammar: topics, total: topics.length });
  } catch (error) {
    console.error('Grammar API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
