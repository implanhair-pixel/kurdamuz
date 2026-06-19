import { db } from '@/db';
import { vocabulary, dialects, dialectVariants, lexicalMeanings, vocabularyExamples } from '@/db/schema';
import { sql, and, or, ilike, inArray, eq, desc, asc } from 'drizzle-orm';
import type { DialectSearchParams, SearchResult } from '@/types/dialects';

/**
 * PostgreSQL Full-Text Search Service for Dialect Comparison
 * 
 * This service provides an abstraction layer over PostgreSQL's tsvector/tsquery
 * capabilities, allowing for future migration to OpenSearch or vector search without
 * changing the API surface.
 * 
 * Supported search types:
 * - Full-text search (tsvector)
 * - Prefix search
 * - Fuzzy search (trigram)
 * - Exact match search
 * - Phonetic search
 * - Root word search
 * - Cross-dialect search
 */

export class DialectSearchService {
  /**
   * Search lexical entries with full-text search capabilities
   */
  async searchLexicalEntries(params: DialectSearchParams): Promise<SearchResult[]> {
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

    // Build the base query with full-text search
    let baseQuery = db
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
      })
      .from(vocabulary);

    // Add full-text search if query is provided
    if (query) {
      baseQuery = (baseQuery as any).where(
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

    // Apply filters
    const conditions = [];

    if (partsOfSpeech && partsOfSpeech.length > 0) {
      conditions.push(inArray(vocabulary.partOfSpeech, partsOfSpeech));
    }

    if (difficultyLevels && difficultyLevels.length > 0) {
      conditions.push(inArray(vocabulary.difficultyLevel, difficultyLevels));
    }

    if (conditions.length > 0) {
      baseQuery = (baseQuery as any).where(and(...conditions));
    }

    // Execute the query
    const entries = await baseQuery
      .orderBy(desc(vocabulary.frequencyRank), asc(vocabulary.kurdishWord))
      .limit(limit)
      .offset(offset);

    // Fetch related data for each entry
    const results: SearchResult[] = [];

    for (const entry of entries) {
      // Get dialects for this entry
      const entryDialects = await this.getDialectsForEntry(entry.entryId);
      
      // Get variants for this entry
      const variants = await this.getVariantsForEntry(entry.entryId, dialectIds);
      
      // Get meanings for this entry
      const meanings = await this.getMeaningsForEntry(entry.entryId, semanticDomains);
      
      // Calculate relevance score
      const relevanceScore = this.calculateRelevanceScore(entry, query, variants, meanings);
      
      results.push({
        entryId: entry.entryId,
        kurdishWord: entry.kurdishWord,
        normalizedForm: entry.normalizedForm || undefined,
        persianTranslation: entry.persianTranslation,
        englishTranslation: entry.englishTranslation || undefined,
        partOfSpeech: entry.partOfSpeech || undefined,
        dialects: entryDialects as any,
        variants: variants as any,
        meanings: meanings as any,
        relevanceScore,
      });
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;
  }

  /**
   * Search by specific dialect
   */
  async searchByDialect(dialectId: string, query?: string, limit = 20): Promise<SearchResult[]> {
    return this.searchLexicalEntries({
      query,
      dialectIds: [dialectId],
      limit,
    });
  }

  /**
   * Search by semantic domain
   */
  async searchBySemanticDomain(semanticDomain: string, query?: string, limit = 20): Promise<SearchResult[]> {
    return this.searchLexicalEntries({
      query,
      semanticDomains: [semanticDomain],
      limit,
    });
  }

  /**
   * Prefix search for autocomplete suggestions
   */
  async prefixSearch(prefix: string, limit = 10): Promise<string[]> {
    const results = await db
      .select({ kurdishWord: vocabulary.kurdishWord })
      .from(vocabulary)
      .where(ilike(vocabulary.kurdishWord, `${prefix}%`))
      .orderBy(asc(vocabulary.kurdishWord))
      .limit(limit);

    return results.map(r => r.kurdishWord);
  }

  /**
   * Phonetic search using trigram similarity
   */
  async phoneticSearch(term: string, limit = 20): Promise<SearchResult[]> {
    // This would use pg_trigram extension for fuzzy matching
    // For now, we'll use ILIKE as a fallback
    const entries = await db
      .select({
        entryId: vocabulary.id,
        kurdishWord: vocabulary.kurdishWord,
        normalizedForm: vocabulary.normalizedForm,
        persianTranslation: vocabulary.persianTranslation,
        englishTranslation: vocabulary.englishTranslation,
        partOfSpeech: vocabulary.partOfSpeech,
      })
      .from(vocabulary)
      .where(
        or(
          ilike(vocabulary.kurdishWord, `%${term}%`),
          ilike(vocabulary.normalizedForm, `%${term}%`),
        )
      )
      .limit(limit);

    const results: SearchResult[] = [];

    for (const entry of entries) {
      const entryDialects = await this.getDialectsForEntry(entry.entryId);
      const variants = await this.getVariantsForEntry(entry.entryId);
      const meanings = await this.getMeaningsForEntry(entry.entryId);

      results.push({
        entryId: entry.entryId,
        kurdishWord: entry.kurdishWord,
        normalizedForm: entry.normalizedForm || undefined,
        persianTranslation: entry.persianTranslation,
        englishTranslation: entry.englishTranslation || undefined,
        partOfSpeech: entry.partOfSpeech || undefined,
        dialects: entryDialects as any,
        variants: variants as any,
        meanings: meanings as any,
        relevanceScore: 0.5, // Default relevance for phonetic search
      });
    }

    return results;
  }

  /**
   * Root word search using the root_form field
   */
  async rootWordSearch(rootForm: string, limit = 20): Promise<SearchResult[]> {
    const entries = await db
      .select({
        entryId: vocabulary.id,
        kurdishWord: vocabulary.kurdishWord,
        normalizedForm: vocabulary.normalizedForm,
        persianTranslation: vocabulary.persianTranslation,
        englishTranslation: vocabulary.englishTranslation,
        partOfSpeech: vocabulary.partOfSpeech,
        rootForm: vocabulary.rootForm,
      })
      .from(vocabulary)
      .where(eq(vocabulary.rootForm, rootForm))
      .limit(limit);

    const results: SearchResult[] = [];

    for (const entry of entries) {
      const entryDialects = await this.getDialectsForEntry(entry.entryId);
      const variants = await this.getVariantsForEntry(entry.entryId);
      const meanings = await this.getMeaningsForEntry(entry.entryId);

      results.push({
        entryId: entry.entryId,
        kurdishWord: entry.kurdishWord,
        normalizedForm: entry.normalizedForm || undefined,
        persianTranslation: entry.persianTranslation,
        englishTranslation: entry.englishTranslation || undefined,
        partOfSpeech: entry.partOfSpeech || undefined,
        dialects: entryDialects as any,
        variants: variants as any,
        meanings: meanings as any,
        relevanceScore: 1.0, // High relevance for exact root match
      });
    }

    return results;
  }

  /**
   * Cross-dialect search to find the same word across different dialects
   */
  async crossDialectSearch(entryId: string): Promise<SearchResult[]> {
    // Get the original entry
    const [originalEntry] = await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.id, entryId))
      .limit(1);

    if (!originalEntry) {
      return [];
    }

    // Search for similar entries across all dialects
    const similarEntries = await db
      .select({
        entryId: vocabulary.id,
        kurdishWord: vocabulary.kurdishWord,
        normalizedForm: vocabulary.normalizedForm,
        persianTranslation: vocabulary.persianTranslation,
        englishTranslation: vocabulary.englishTranslation,
        partOfSpeech: vocabulary.partOfSpeech,
      })
      .from(vocabulary)
      .where(
        and(
          eq(vocabulary.persianTranslation, originalEntry.persianTranslation),
          sql`${vocabulary.id} != ${entryId}`
        )
      );

    const results: SearchResult[] = [];

    for (const entry of similarEntries) {
      const entryDialects = await this.getDialectsForEntry(entry.entryId);
      const variants = await this.getVariantsForEntry(entry.entryId);
      const meanings = await this.getMeaningsForEntry(entry.entryId);

      results.push({
        entryId: entry.entryId,
        kurdishWord: entry.kurdishWord,
        normalizedForm: entry.normalizedForm || undefined,
        persianTranslation: entry.persianTranslation,
        englishTranslation: entry.englishTranslation || undefined,
        partOfSpeech: entry.partOfSpeech || undefined,
        dialects: entryDialects as any,
        variants: variants as any,
        meanings: meanings as any,
        relevanceScore: 0.9, // High relevance for cross-dialect matches
      });
    }

    return results;
  }

  // Helper methods

  private async getDialectsForEntry(entryId: string) {
    const results = await db
      .select({ dialect: dialects })
      .from(dialects)
      .innerJoin(dialectVariants, eq(dialects.id, dialectVariants.dialectId))
      .where(eq(dialectVariants.entryId, entryId));

    return results.map(r => r.dialect);
  }

  private async getVariantsForEntry(entryId: string, dialectIds?: string[]) {
    let query = db
      .select()
      .from(dialectVariants)
      .where(eq(dialectVariants.entryId, entryId));

    if (dialectIds && dialectIds.length > 0) {
      query = (query as any).where(inArray(dialectVariants.dialectId, dialectIds));
    }

    return await query;
  }

  private async getMeaningsForEntry(entryId: string, semanticDomains?: string[]) {
    let query = db
      .select()
      .from(lexicalMeanings)
      .where(eq(lexicalMeanings.entryId, entryId));

    if (semanticDomains && semanticDomains.length > 0) {
      query = (query as any).where(inArray(lexicalMeanings.semanticDomain, semanticDomains));
    }

    return await query;
  }

  private calculateRelevanceScore(
    entry: any,
    query?: string,
    variants?: any[],
    meanings?: any[]
  ): number {
    let score = 0;

    // Base score from frequency rank (higher rank = higher score)
    if (entry.frequencyRank) {
      score += Math.max(0, 1 - entry.frequencyRank / 1000) * 0.3;
    }

    // Query match score
    if (query) {
      const queryLower = query.toLowerCase();
      if (entry.kurdishWord.toLowerCase().includes(queryLower)) {
        score += 0.4;
      }
      if (entry.persianTranslation.toLowerCase().includes(queryLower)) {
        score += 0.3;
      }
      if (entry.englishTranslation && entry.englishTranslation.toLowerCase().includes(queryLower)) {
        score += 0.2;
      }
    }

    // Variant count bonus
    if (variants && variants.length > 0) {
      score += Math.min(variants.length * 0.05, 0.2);
    }

    // Meaning count bonus
    if (meanings && meanings.length > 0) {
      score += Math.min(meanings.length * 0.05, 0.2);
    }

    return Math.min(score, 1.0);
  }
}

// Export singleton instance
export const dialectSearchService = new DialectSearchService();
