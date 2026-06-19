import { db } from '@/db';
import { vocabulary, dialects, dialectVariants, lexicalMeanings } from '@/db/schema';
import { eq, and, or, inArray, ilike, sql, desc, asc } from 'drizzle-orm';
import type { DialectSearchParams, DialectFilterOptions } from '@/types/dialects';

/**
 * Flexible Filtering System for Dialect Comparison
 * 
 * This service provides dynamic filter composition and performance-optimized
 * query generation for the dialect comparison platform.
 */

export class DialectFilterService {
  /**
   * Get available filter options based on current data
   */
  async getFilterOptions(): Promise<DialectFilterOptions> {
    // Get all active dialects
    const allDialects = await db
      .select()
      .from(dialects)
      .where(eq(dialects.status, 'active'))
      .orderBy(dialects.name);

    // Get unique regions
    const regions = [...new Set(allDialects.map(d => d.region).filter(Boolean))];

    // Get unique parts of speech
    const partsOfSpeechResult = await db
      .selectDistinct({ partOfSpeech: vocabulary.partOfSpeech })
      .from(vocabulary)
      .where(sql`${vocabulary.partOfSpeech} IS NOT NULL`)
      .orderBy(vocabulary.partOfSpeech);

    const partsOfSpeech = partsOfSpeechResult.map(r => r.partOfSpeech).filter(Boolean) as string[];

    // Get unique semantic domains
    const semanticDomainsResult = await db
      .selectDistinct({ semanticDomain: lexicalMeanings.semanticDomain })
      .from(lexicalMeanings)
      .where(sql`${lexicalMeanings.semanticDomain} IS NOT NULL`)
      .orderBy(lexicalMeanings.semanticDomain);

    const semanticDomains = semanticDomainsResult.map(r => r.semanticDomain).filter(Boolean) as string[];

    // Get unique difficulty levels
    const difficultyLevelsResult = await db
      .selectDistinct({ difficultyLevel: vocabulary.difficultyLevel })
      .from(vocabulary)
      .where(sql`${vocabulary.difficultyLevel} IS NOT NULL`)
      .orderBy(vocabulary.difficultyLevel);

    const difficultyLevels = difficultyLevelsResult.map(r => r.difficultyLevel).filter(Boolean) as string[];

    // Get unique usage frequencies
    const usageFrequenciesResult = await db
      .selectDistinct({ usageFrequency: dialectVariants.usageFrequency })
      .from(dialectVariants)
      .where(sql`${dialectVariants.usageFrequency} IS NOT NULL`)
      .orderBy(dialectVariants.usageFrequency);

    const usageFrequencies = usageFrequenciesResult.map(r => r.usageFrequency).filter(Boolean) as ('common' | 'uncommon' | 'rare' | 'archaic')[];

    return {
      dialects: allDialects,
      regions: regions as string[],
      partsOfSpeech: partsOfSpeech as string[],
      semanticDomains: semanticDomains as string[],
      difficultyLevels: difficultyLevels as string[],
      usageFrequencies: usageFrequencies as any,
    };
  }

  /**
   * Build and execute a filtered query based on search parameters
   */
  async buildFilteredQuery(params: DialectSearchParams) {
    const {
      query,
      dialectIds,
      regions,
      partsOfSpeech,
      semanticDomains,
      difficultyLevels,
      usageFrequencies,
      limit = 20,
      offset = 0,
    } = params;

    // Start with base query
    let queryBuilder = db
      .select({
        entryId: vocabulary.id,
        kurdishWord: vocabulary.kurdishWord,
        normalizedForm: vocabulary.normalizedForm,
        persianTranslation: vocabulary.persianTranslation,
        englishTranslation: vocabulary.englishTranslation,
        partOfSpeech: vocabulary.partOfSpeech,
        pronunciation: vocabulary.pronunciation,
        difficultyLevel: vocabulary.difficultyLevel,
        frequencyRank: vocabulary.frequencyRank,
        rootForm: vocabulary.rootForm,
        etymology: vocabulary.etymology,
      })
      .from(vocabulary);

    // Build conditions array
    const conditions = [];

    // Add full-text search if query is provided
    if (query) {
      conditions.push(
        or(
          sql`to_tsvector('simple', ${vocabulary.kurdishWord}) @@ plainto_tsquery('simple', ${query})`,
          sql`to_tsvector('simple', ${vocabulary.normalizedForm}) @@ plainto_tsquery('simple', ${query})`,
          sql`to_tsvector('simple', ${vocabulary.persianTranslation}) @@ plainto_tsquery('simple', ${query})`,
          sql`to_tsvector('simple', ${vocabulary.englishTranslation}) @@ plainto_tsquery('simple', ${query})`,
          ilike(vocabulary.kurdishWord, `%${query}%`),
          ilike(vocabulary.normalizedForm, `%${query}%`),
          ilike(vocabulary.persianTranslation, `%${query}%`),
          ilike(vocabulary.englishTranslation, `%${query}%`),
        )
      );
    }

    // Filter by dialects (via dialect_variants)
    if (dialectIds && dialectIds.length > 0) {
      const dialectFilteredEntries = await db
        .selectDistinct({ entryId: dialectVariants.entryId })
        .from(dialectVariants)
        .where(inArray(dialectVariants.dialectId, dialectIds));

      const entryIds = dialectFilteredEntries.map(e => e.entryId);
      if (entryIds.length > 0) {
        conditions.push(inArray(vocabulary.id, entryIds));
      }
    }

    // Filter by parts of speech
    if (partsOfSpeech && partsOfSpeech.length > 0) {
      conditions.push(inArray(vocabulary.partOfSpeech, partsOfSpeech));
    }

    // Filter by difficulty levels
    if (difficultyLevels && difficultyLevels.length > 0) {
      conditions.push(inArray(vocabulary.difficultyLevel, difficultyLevels));
    }

    // Filter by semantic domains (via lexical_meanings)
    if (semanticDomains && semanticDomains.length > 0) {
      const semanticFilteredEntries = await db
        .selectDistinct({ entryId: lexicalMeanings.entryId })
        .from(lexicalMeanings)
        .where(inArray(lexicalMeanings.semanticDomain, semanticDomains));

      const entryIds = semanticFilteredEntries.map(e => e.entryId);
      if (entryIds.length > 0) {
        conditions.push(inArray(vocabulary.id, entryIds));
      }
    }

    // Filter by usage frequencies (via dialect_variants)
    if (usageFrequencies && usageFrequencies.length > 0) {
      const usageFilteredEntries = await db
        .selectDistinct({ entryId: dialectVariants.entryId })
        .from(dialectVariants)
        .where(inArray(dialectVariants.usageFrequency, usageFrequencies as any));

      const entryIds = usageFilteredEntries.map(e => e.entryId);
      if (entryIds.length > 0) {
        conditions.push(inArray(vocabulary.id, entryIds));
      }
    }

    // Apply all conditions
    if (conditions.length > 0) {
      queryBuilder = (queryBuilder as any).where(and(...conditions));
    }

    // Apply ordering
    queryBuilder = (queryBuilder as any).orderBy(
      desc(vocabulary.frequencyRank),
      asc(vocabulary.kurdishWord)
    );

    // Apply pagination
    queryBuilder = (queryBuilder as any).limit(limit).offset(offset);

    // Execute query
    const results = await queryBuilder;

    return results;
  }

  /**
   * Count total results for a filter combination (for pagination)
   */
  async countFilteredResults(params: DialectSearchParams): Promise<number> {
    const {
      query,
      dialectIds,
      partsOfSpeech,
      semanticDomains,
      difficultyLevels,
      usageFrequencies,
    } = params;

    let countQuery = db.select({ count: sql<number>`count(*)` }).from(vocabulary);

    const conditions = [];

    if (query) {
      conditions.push(
        or(
          sql`to_tsvector('simple', ${vocabulary.kurdishWord}) @@ plainto_tsquery('simple', ${query})`,
          ilike(vocabulary.kurdishWord, `%${query}%`),
          ilike(vocabulary.persianTranslation, `%${query}%`),
        )
      );
    }

    if (dialectIds && dialectIds.length > 0) {
      const dialectFilteredEntries = await db
        .selectDistinct({ entryId: dialectVariants.entryId })
        .from(dialectVariants)
        .where(inArray(dialectVariants.dialectId, dialectIds));

      const entryIds = dialectFilteredEntries.map(e => e.entryId);
      if (entryIds.length > 0) {
        conditions.push(inArray(vocabulary.id, entryIds));
      }
    }

    if (partsOfSpeech && partsOfSpeech.length > 0) {
      conditions.push(inArray(vocabulary.partOfSpeech, partsOfSpeech));
    }

    if (difficultyLevels && difficultyLevels.length > 0) {
      conditions.push(inArray(vocabulary.difficultyLevel, difficultyLevels));
    }

    if (semanticDomains && semanticDomains.length > 0) {
      const semanticFilteredEntries = await db
        .selectDistinct({ entryId: lexicalMeanings.entryId })
        .from(lexicalMeanings)
        .where(inArray(lexicalMeanings.semanticDomain, semanticDomains));

      const entryIds = semanticFilteredEntries.map(e => e.entryId);
      if (entryIds.length > 0) {
        conditions.push(inArray(vocabulary.id, entryIds));
      }
    }

    if (usageFrequencies && usageFrequencies.length > 0) {
      const usageFilteredEntries = await db
        .selectDistinct({ entryId: dialectVariants.entryId })
        .from(dialectVariants)
        .where(inArray(dialectVariants.usageFrequency, usageFrequencies as any));

      const entryIds = usageFilteredEntries.map(e => e.entryId);
      if (entryIds.length > 0) {
        conditions.push(inArray(vocabulary.id, entryIds));
      }
    }

    if (conditions.length > 0) {
      countQuery = (countQuery as any).where(and(...conditions));
    }

    const [result] = await countQuery;
    return result.count;
  }

  /**
   * Validate filter parameters
   */
  validateFilterParams(params: DialectSearchParams): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (params.limit && (params.limit < 1 || params.limit > 100)) {
      errors.push('Limit must be between 1 and 100');
    }

    if (params.offset && params.offset < 0) {
      errors.push('Offset must be non-negative');
    }

    if (params.difficultyLevels) {
      const validDifficultyLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
      const invalidLevels = params.difficultyLevels.filter(
        level => !validDifficultyLevels.includes(level)
      );
      if (invalidLevels.length > 0) {
        errors.push(`Invalid difficulty levels: ${invalidLevels.join(', ')}`);
      }
    }

    if (params.usageFrequencies) {
      const validFrequencies = ['common', 'uncommon', 'rare', 'archaic'];
      const invalidFrequencies = params.usageFrequencies.filter(
        freq => !validFrequencies.includes(freq)
      );
      if (invalidFrequencies.length > 0) {
        errors.push(`Invalid usage frequencies: ${invalidFrequencies.join(', ')}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Serialize filter parameters for URL or storage
   */
  serializeFilters(params: DialectSearchParams): string {
    return JSON.stringify(params);
  }

  /**
   * Deserialize filter parameters from URL or storage
   */
  deserializeFilters(serialized: string): DialectSearchParams {
    try {
      return JSON.parse(serialized) as DialectSearchParams;
    } catch (error) {
      console.error('Error deserializing filters:', error);
      return {
        limit: 20,
        offset: 0,
      };
    }
  }

  /**
   * Get suggested filters based on current query
   */
  async getSuggestedFilters(params: DialectSearchParams): Promise<{
    suggestedDialects: string[];
    suggestedPartsOfSpeech: string[];
    suggestedSemanticDomains: string[];
  }> {
    const results = await this.buildFilteredQuery({
      ...params,
      limit: 50, // Get more results for analysis
    });

    // Get dialect IDs from results
    const dialectIds = await Promise.all(
      results.map(async (result) => {
        const variants = await db
          .select({ dialectId: dialectVariants.dialectId })
          .from(dialectVariants)
          .where(eq(dialectVariants.entryId, result.entryId));
        return variants.map(v => v.dialectId);
      })
    );

    const flatDialectIds = dialectIds.flat();
    const dialectCounts = flatDialectIds.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const suggestedDialects = Object.entries(dialectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    // Get parts of speech from results
    const partsOfSpeechCounts = results.reduce((acc, result) => {
      if (result.partOfSpeech) {
        acc[result.partOfSpeech] = (acc[result.partOfSpeech] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const suggestedPartsOfSpeech = Object.entries(partsOfSpeechCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pos]) => pos);

    // Get semantic domains from results
    const entryIds = results.map(r => r.entryId);
    const semanticDomainsResult = await db
      .select({ semanticDomain: lexicalMeanings.semanticDomain })
      .from(lexicalMeanings)
      .where(inArray(lexicalMeanings.entryId, entryIds));

    const semanticDomainsCounts = semanticDomainsResult.reduce((acc, result) => {
      if (result.semanticDomain) {
        acc[result.semanticDomain] = (acc[result.semanticDomain] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const suggestedSemanticDomains = Object.entries(semanticDomainsCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([domain]) => domain);

    return {
      suggestedDialects,
      suggestedPartsOfSpeech,
      suggestedSemanticDomains,
    };
  }
}

// Export singleton instance
export const dialectFilterService = new DialectFilterService();
