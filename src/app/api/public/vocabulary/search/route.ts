import { NextRequest, NextResponse } from 'next/server';
import { getWords, isDialect } from '@/lib/content/reader';
import { DIALECTS, type Dialect, type WordEntry } from '@/types/content';

/**
 * Vocabulary search with relevance scoring.
 *
 * IMPORTANT: This reads exclusively from the local /data/<dialect>/words.json
 * files via src/lib/content/reader.ts — there is no database query here.
 * See data/FORMAT.md for the file format.
 */

interface ScoredResult {
  vocabulary: WordEntry & { dialect: Dialect };
  relevanceScore: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || '';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20)
    );
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    const dialectIdsParam = searchParams.get('dialectIds')?.split(',').filter(Boolean);
    const difficultyLevels = searchParams.get('difficultyLevels')?.split(',').filter(Boolean);
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    let dialectsToSearch: Dialect[] = DIALECTS;
    if (dialectIdsParam && dialectIdsParam.length > 0) {
      const validDialects = dialectIdsParam.filter(isDialect);
      if (validDialects.length > 0) dialectsToSearch = validDialects;
    }

    let words: (WordEntry & { dialect: Dialect })[] = dialectsToSearch.flatMap((dialect) =>
      getWords(dialect).map((w) => ({ ...w, dialect }))
    );

    if (categories && categories.length > 0) {
      words = words.filter((w) => categories.includes(w.category));
    }

    if (difficultyLevels && difficultyLevels.length > 0) {
      words = words.filter((w) => difficultyLevels.includes(String(w.difficulty)));
    }

    if (tags && tags.length > 0) {
      words = words.filter((w) => w.tags?.some((t) => tags.includes(t)));
    }

    const queryLower = query.toLowerCase();
    const resultsWithRelevance: ScoredResult[] = words
      .map((v) => {
        const kurdishLower = v.kurdish.toLowerCase();
        const persianLower = v.persian.toLowerCase();
        const englishLower = v.english?.toLowerCase() || '';
        const transliterationLower = v.transliteration.toLowerCase();

        let score = 0;
        if (kurdishLower === queryLower) score += 100;
        else if (kurdishLower.startsWith(queryLower)) score += 80;
        else if (kurdishLower.includes(queryLower)) score += 60;

        if (persianLower === queryLower) score += 90;
        else if (persianLower.startsWith(queryLower)) score += 70;
        else if (persianLower.includes(queryLower)) score += 50;

        if (englishLower === queryLower) score += 85;
        else if (englishLower.startsWith(queryLower)) score += 65;
        else if (englishLower.includes(queryLower)) score += 45;

        if (transliterationLower.includes(queryLower)) score += 30;

        return { vocabulary: v, relevanceScore: score };
      })
      .filter((r) => r.relevanceScore > 0);

    // Sort
    const validSortColumns: Record<string, (a: ScoredResult, b: ScoredResult) => number> = {
      relevance: (a, b) => a.relevanceScore - b.relevanceScore,
      kurdish_word: (a, b) => a.vocabulary.kurdish.localeCompare(b.vocabulary.kurdish),
      difficulty_level: (a, b) => a.vocabulary.difficulty - b.vocabulary.difficulty,
    };
    const comparator = validSortColumns[sortBy] || validSortColumns.relevance;
    resultsWithRelevance.sort((a, b) =>
      sortDirection === 'asc' ? comparator(a, b) : -comparator(a, b)
    );

    const total = resultsWithRelevance.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const from = (page - 1) * limit;
    const paged = resultsWithRelevance.slice(from, from + limit);

    return NextResponse.json({
      results: paged,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Vocabulary search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

