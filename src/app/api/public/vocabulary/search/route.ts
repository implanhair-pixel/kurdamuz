import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { searchOptionsSchema } from '@/types/search';

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

    // Parse search options
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    
    // Parse filters
    const dialectIds = searchParams.get('dialectIds')?.split(',').filter(Boolean);
    const difficultyLevels = searchParams.get('difficultyLevels')?.split(',').filter(Boolean);
    const categories = searchParams.get('categories')?.split(',').filter(Boolean);
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const status = searchParams.get('status')?.split(',').filter(Boolean);

    // Build search query with full-text search
    let dbQuery = supabaseAdmin
      .from('vocabulary')
      .select(`
        *,
        dialects:vocabulary_dialects(
          dialect:dialects(*)
        ),
        tags:vocabulary_tag_assignments(
          tag:vocabulary_tags(*)
        ),
        examples:vocabulary_examples(*)
      `, { count: 'exact' });

    // Full-text search across multiple fields
    const searchCondition = `
      kurdish_word.ilike.%${query}% OR
      persian_translation.ilike.%${query}% OR
      english_translation.ilike.%${query}% OR
      pronunciation.ilike.%${query}%
    `;
    
    dbQuery = dbQuery.or(searchCondition);

    // Apply filters
    if (status && status.length > 0) {
      dbQuery = dbQuery.in('status', status);
    }

    if (difficultyLevels && difficultyLevels.length > 0) {
      dbQuery = dbQuery.in('difficulty_level', difficultyLevels);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    dbQuery = dbQuery.range(from, to);

    // Apply sorting
    const validSortColumns = ['created_at', 'updated_at', 'frequency_rank', 'difficulty_level', 'kurdish_word'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    dbQuery = dbQuery.order(sortColumn, { ascending: sortDirection === 'asc' });

    const { data: vocabulary, error, count } = await dbQuery;

    if (error) {
      console.error('Vocabulary search error:', error);
      return NextResponse.json(
        { error: 'Failed to search vocabulary' },
        { status: 500 }
      );
    }

    // Filter by dialects, categories, and tags in memory
    let filteredVocabulary = vocabulary || [];
    
    if (dialectIds && dialectIds.length > 0) {
      filteredVocabulary = filteredVocabulary.filter((v: any) => 
        v.dialects?.some((d: any) => dialectIds.includes(d.dialect.id))
      );
    }

    if (tags && tags.length > 0) {
      filteredVocabulary = filteredVocabulary.filter((v: any) => 
        v.tags?.some((t: any) => tags.includes(t.tag.id))
      );
    }

    // Calculate relevance score (simple implementation)
    const resultsWithRelevance = filteredVocabulary.map((v: any) => {
      let score = 0;
      const kurdishLower = v.kurdish_word.toLowerCase();
      const persianLower = v.persian_translation.toLowerCase();
      const englishLower = v.english_translation?.toLowerCase() || '';
      const queryLower = query.toLowerCase();

      // Exact match gets highest score
      if (kurdishLower === queryLower) score += 100;
      else if (kurdishLower.startsWith(queryLower)) score += 80;
      else if (kurdishLower.includes(queryLower)) score += 60;

      if (persianLower === queryLower) score += 90;
      else if (persianLower.startsWith(queryLower)) score += 70;
      else if (persianLower.includes(queryLower)) score += 50;

      if (englishLower === queryLower) score += 85;
      else if (englishLower.startsWith(queryLower)) score += 65;
      else if (englishLower.includes(queryLower)) score += 45;

      return { vocabulary: v, relevanceScore: score };
    });

    // Sort by relevance if requested
    if (sortBy === 'relevance') {
      resultsWithRelevance.sort((a, b) => 
        sortDirection === 'desc' 
          ? b.relevanceScore - a.relevanceScore
          : a.relevanceScore - b.relevanceScore
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      results: resultsWithRelevance,
      pagination: {
        page,
        limit,
        total: count || 0,
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
