import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { searchOptionsSchema } from '@/types/search';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse search options
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    
    // Parse filters
    const dialectIds = searchParams.get('dialectIds')?.split(',');
    const difficultyLevels = searchParams.get('difficultyLevels')?.split(',');
    const categories = searchParams.get('categories')?.split(',');
    const tags = searchParams.get('tags')?.split(',');
    const status = searchParams.get('status')?.split(',');
    const query = searchParams.get('query');

    // Build base query
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

    // Apply filters
    if (query) {
      // Full-text search
      dbQuery = dbQuery.or(`kurdish_word.ilike.%${query}%,persian_translation.ilike.%${query}%,english_translation.ilike.%${query}%`);
    }

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
      console.error('Vocabulary fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vocabulary' },
        { status: 500 }
      );
    }

    // Filter by dialects, categories, and tags in memory (since they're nested)
    let filteredVocabulary = vocabulary || [];
    
    if (dialectIds && dialectIds.length > 0) {
      filteredVocabulary = filteredVocabulary.filter((v: any) => 
        v.dialects?.some((d: any) => dialectIds.includes(d.dialect.id))
      );
    }

    if (categories && categories.length > 0) {
      // Would need to add category relationship to vocabulary
      // For now, skip this filter
    }

    if (tags && tags.length > 0) {
      filteredVocabulary = filteredVocabulary.filter((v: any) => 
        v.tags?.some((t: any) => tags.includes(t.tag.id))
      );
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      vocabulary: filteredVocabulary,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Vocabulary API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
