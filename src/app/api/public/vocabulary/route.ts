import { NextRequest, NextResponse } from 'next/server';
import { getWords, isDialect } from '@/lib/content/reader';
import { DIALECTS, type Dialect, type WordEntry } from '@/types/content';

/**
 * Public vocabulary listing sourced exclusively from /data/<dialect>/words.json.
 */

type VocabularyEntry = WordEntry & { dialect: Dialect };

interface ScoredResult {
  vocabulary: VocabularyEntry;
  relevanceScore: number;
}

function scoreEntry(entry: VocabularyEntry, queryLower: string): number {
  const kurdishLower = entry.kurdish.toLowerCase();
  const persianLower = entry.persian.toLowerCase();
  const englishLower = entry.english?.toLowerCase() || '';
  const transliterationLower = entry.transliteration.toLowerCase();

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
  return score;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10) || 20));
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    const dialectParam = searchParams.get('dialect');
    const dialectIdsParam = searchParams.get('dialectIds')?.split(',').filter(Boolean);

    let dialectsToSearch: Dialect[] = DIALECTS;
    if (dialectParam) {
      if (!isDialect(dialectParam)) {
        return NextResponse.json(
          { error: `Invalid dialect "${dialectParam}". Must be one of: ${DIALECTS.join(', ')}` },
          { status: 400 },
        );
      }
      dialectsToSearch = [dialectParam];
    } else if (dialectIdsParam && dialectIdsParam.length > 0) {
      const valid = dialectIdsParam.filter(isDialect);
      if (valid.length > 0) dialectsToSearch = valid;
    }

    const difficultyLevels = searchParams.get('difficultyLevels')?.split(',').filter(Boolean);
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    let vocabulary: VocabularyEntry[] = dialectsToSearch.flatMap((dialect) =>
      getWords(dialect).map((word) => ({ ...word, dialect }))
    );

    if (categories?.length) {
      vocabulary = vocabulary.filter((entry) => categories.includes(entry.category));
    }
    if (difficultyLevels?.length) {
      vocabulary = vocabulary.filter((entry) => difficultyLevels.includes(String(entry.difficulty)));
    }
    if (tags?.length) {
      vocabulary = vocabulary.filter((entry) => entry.tags?.some((tag) => tags.includes(tag)));
    }

    let results: ScoredResult[] = vocabulary.map((entry) => ({
      vocabulary: entry,
      relevanceScore: query ? scoreEntry(entry, query.toLowerCase()) : 1,
    }));

    if (query) {
      results = results.filter((result) => result.relevanceScore > 0);
    }

    const comparators: Record<string, (a: ScoredResult, b: ScoredResult) => number> = {
      relevance: (a, b) => a.relevanceScore - b.relevanceScore,
      kurdish_word: (a, b) => a.vocabulary.kurdish.localeCompare(b.vocabulary.kurdish),
      difficulty_level: (a, b) => a.vocabulary.difficulty - b.vocabulary.difficulty,
    };

    const comparator = comparators[sortBy] || comparators.relevance;
    results.sort((a, b) => (sortDirection === 'asc' ? comparator(a, b) : -comparator(a, b)));

    const total = results.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const from = (page - 1) * limit;
    const paged = results.slice(from, from + limit).map((result) => result.vocabulary);

    return NextResponse.json({
      vocabulary: paged,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Vocabulary API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
