import { db } from '@/db';
import { vocabulary, dialects, dialectVariants, lexicalMeanings } from '@/db/schema';
import { eq, and, or, inArray, sql } from 'drizzle-orm';
import type { ComparisonResult } from '@/types/dialects';

/**
 * Cross-Dialect Vocabulary Comparison Engine
 * 
 * This service provides sophisticated comparison capabilities across Kurdish dialects,
 * including phonetic similarity, morphological comparison, usage frequency analysis,
 * and semantic comparison.
 */

export class LexicalComparator {
  /**
   * Compare two lexical entries across dialects
   */
  async compareEntries(sourceEntryId: string, targetEntryId: string): Promise<ComparisonResult | null> {
    // Get source entry
    const [sourceEntry] = await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.id, sourceEntryId))
      .limit(1);

    if (!sourceEntry) {
      return null;
    }

    // Get target entry
    const [targetEntry] = await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.id, targetEntryId))
      .limit(1);

    if (!targetEntry) {
      return null;
    }

    // Get dialects for both entries
    const sourceDialects = await this.getDialectsForEntry(sourceEntryId);
    const targetDialects = await this.getDialectsForEntry(targetEntryId);

    // Calculate similarity score
    const similarityScore = this.calculateSimilarityScore(sourceEntry, targetEntry);

    // Find differences
    const differences = this.findDifferences(sourceEntry, targetEntry, sourceDialects, targetDialects);

    // Find commonalities
    const commonalities = this.findCommonalities(sourceEntry, targetEntry);

    return {
      sourceEntry: {
        id: sourceEntry.id,
        kurdishWord: sourceEntry.kurdishWord,
        dialect: sourceDialects[0] as any || null,
      },
      targetEntry: {
        id: targetEntry.id,
        kurdishWord: targetEntry.kurdishWord,
        dialect: targetDialects[0] as any || null,
      },
      similarityScore,
      differences,
      commonalities,
    };
  }

  /**
   * Find all lexical variations of a word across dialects
   */
  async findLexicalVariations(entryId: string): Promise<ComparisonResult[]> {
    const [sourceEntry] = await db
      .select()
      .from(vocabulary)
      .where(eq(vocabulary.id, entryId))
      .limit(1);

    if (!sourceEntry) {
      return [];
    }

    // Find entries with the same Persian translation (likely same meaning)
    const similarEntries = await db
      .select()
      .from(vocabulary)
      .where(
        and(
          eq(vocabulary.persianTranslation, sourceEntry.persianTranslation),
          sql`${vocabulary.id} != ${entryId}`
        )
      );

    const comparisons: ComparisonResult[] = [];

    for (const targetEntry of similarEntries) {
      const comparison = await this.compareEntries(entryId, targetEntry.id);
      if (comparison) {
        comparisons.push(comparison);
      }
    }

    // Sort by similarity score
    comparisons.sort((a, b) => b.similarityScore - a.similarityScore);

    return comparisons;
  }

  /**
   * Analyze semantic differences between entries
   */
  async analyzeSemanticDifferences(entryId: string): Promise<{
    semanticDomains: string[];
    difficultyLevels: string[];
    meaningCount: number;
  }> {
    const meanings = await db
      .select()
      .from(lexicalMeanings)
      .where(eq(lexicalMeanings.entryId, entryId));

    const semanticDomains = [...new Set(meanings.map(m => m.semanticDomain).filter(Boolean))] as string[];
    const difficultyLevels = [...new Set(meanings.map(m => m.difficultyLevel).filter(Boolean))] as string[];

    return {
      semanticDomains,
      difficultyLevels,
      meaningCount: meanings.length,
    };
  }

  /**
   * Compare vocabulary across multiple dialects
   */
  async compareAcrossDialects(vocabularyIds: string[]): Promise<{
    entries: Array<{
      id: string;
      kurdishWord: string;
      dialects: any[];
      variants: any[];
    }>;
    commonalities: string[];
    differences: string[];
  }> {
    const entries = await db
      .select()
      .from(vocabulary)
      .where(inArray(vocabulary.id, vocabularyIds));

    const enrichedEntries = [];

    for (const entry of entries) {
      const entryDialects = await this.getDialectsForEntry(entry.id);
      const variants = await this.getVariantsForEntry(entry.id);

      enrichedEntries.push({
        id: entry.id,
        kurdishWord: entry.kurdishWord,
        dialects: entryDialects,
        variants: variants,
      });
    }

    // Find commonalities
    const commonalities = this.findCrossEntryCommonalities(enrichedEntries);
    
    // Find differences
    const differences = this.findCrossEntryDifferences(enrichedEntries);

    return {
      entries: enrichedEntries,
      commonalities,
      differences,
    };
  }

  /**
   * Calculate phonetic similarity between two words
   */
  calculatePhoneticSimilarity(word1: string, word2: string): number {
    // Simple Levenshtein distance-based similarity
    const distance = this.levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);
    
    if (maxLength === 0) return 1;
    
    return 1 - distance / maxLength;
  }

  /**
   * Calculate morphological similarity
   */
  calculateMorphologicalSimilarity(word1: string, word2: string): number {
    // Check for common prefixes and suffixes
    const commonPrefix = this.findCommonPrefix(word1, word2);
    const commonSuffix = this.findCommonSuffix(word1, word2);
    
    const prefixScore = commonPrefix.length / Math.min(word1.length, word2.length);
    const suffixScore = commonSuffix.length / Math.min(word1.length, word2.length);
    
    return (prefixScore + suffixScore) / 2;
  }

  /**
   * Analyze usage frequency patterns
   */
  async analyzeUsageFrequency(entryId: string): Promise<{
    highFrequency: number;
    mediumFrequency: number;
    lowFrequency: number;
    rare: number;
  }> {
    const variants = await this.getVariantsForEntry(entryId);

    const frequencyCounts = {
      highFrequency: 0,
      mediumFrequency: 0,
      lowFrequency: 0,
      rare: 0,
    };

    for (const variant of variants) {
      if (variant.usageFrequency === 'common') {
        frequencyCounts.highFrequency++;
      } else if (variant.usageFrequency === 'uncommon') {
        frequencyCounts.mediumFrequency++;
      } else if (variant.usageFrequency === 'rare') {
        frequencyCounts.lowFrequency++;
      } else if (variant.usageFrequency === 'archaic') {
        frequencyCounts.rare++;
      }
    }

    return frequencyCounts;
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

  private async getVariantsForEntry(entryId: string) {
    return await db
      .select()
      .from(dialectVariants)
      .where(eq(dialectVariants.entryId, entryId));
  }

  private calculateSimilarityScore(sourceEntry: any, targetEntry: any): number {
    let score = 0;

    // Persian translation match (strong indicator of same meaning)
    if (sourceEntry.persianTranslation === targetEntry.persianTranslation) {
      score += 0.5;
    }

    // English translation match
    if (sourceEntry.englishTranslation === targetEntry.englishTranslation) {
      score += 0.2;
    }

    // Part of speech match
    if (sourceEntry.partOfSpeech === targetEntry.partOfSpeech) {
      score += 0.1;
    }

    // Phonetic similarity
    const phoneticScore = this.calculatePhoneticSimilarity(
      sourceEntry.kurdishWord,
      targetEntry.kurdishWord
    );
    score += phoneticScore * 0.15;

    // Morphological similarity
    const morphologicalScore = this.calculateMorphologicalSimilarity(
      sourceEntry.kurdishWord,
      targetEntry.kurdishWord
    );
    score += morphologicalScore * 0.05;

    return Math.min(score, 1.0);
  }

  private findDifferences(
    sourceEntry: any,
    targetEntry: any,
    sourceDialects: any[],
    targetDialects: any[]
  ): string[] {
    const differences: string[] = [];

    // Word form differences
    if (sourceEntry.kurdishWord !== targetEntry.kurdishWord) {
      differences.push(`Word form: ${sourceEntry.kurdishWord} vs ${targetEntry.kurdishWord}`);
    }

    // Dialect differences
    const sourceDialectNames = sourceDialects.map(d => d.name).join(', ');
    const targetDialectNames = targetDialects.map(d => d.name).join(', ');
    
    if (sourceDialectNames !== targetDialectNames) {
      differences.push(`Dialects: ${sourceDialectNames} vs ${targetDialectNames}`);
    }

    // Part of speech differences
    if (sourceEntry.partOfSpeech !== targetEntry.partOfSpeech) {
      differences.push(`Part of speech: ${sourceEntry.partOfSpeech || 'N/A'} vs ${targetEntry.partOfSpeech || 'N/A'}`);
    }

    // Normalized form differences
    if (sourceEntry.normalizedForm !== targetEntry.normalizedForm) {
      differences.push(`Normalized form: ${sourceEntry.normalizedForm || 'N/A'} vs ${targetEntry.normalizedForm || 'N/A'}`);
    }

    return differences;
  }

  private findCommonalities(sourceEntry: any, targetEntry: any): string[] {
    const commonalities: string[] = [];

    // Shared Persian translation
    if (sourceEntry.persianTranslation === targetEntry.persianTranslation) {
      commonalities.push(`Shared Persian translation: ${sourceEntry.persianTranslation}`);
    }

    // Shared English translation
    if (sourceEntry.englishTranslation && targetEntry.englishTranslation && 
        sourceEntry.englishTranslation === targetEntry.englishTranslation) {
      commonalities.push(`Shared English translation: ${sourceEntry.englishTranslation}`);
    }

    // Shared part of speech
    if (sourceEntry.partOfSpeech && targetEntry.partOfSpeech && 
        sourceEntry.partOfSpeech === targetEntry.partOfSpeech) {
      commonalities.push(`Shared part of speech: ${sourceEntry.partOfSpeech}`);
    }

    // Shared root form
    if (sourceEntry.rootForm && targetEntry.rootForm && 
        sourceEntry.rootForm === targetEntry.rootForm) {
      commonalities.push(`Shared root form: ${sourceEntry.rootForm}`);
    }

    return commonalities;
  }

  private findCrossEntryCommonalities(entries: any[]): string[] {
    const commonalities: string[] = [];

    if (entries.length === 0) return commonalities;

    // Check for shared Persian translations
    const persianTranslations = entries.map(e => e.kurdishWord); // Using kurdishWord as proxy
    if (new Set(persianTranslations).size === 1) {
      commonalities.push('All entries share the same word form');
    }

    // Check for shared dialects
    const allDialects = entries.flatMap(e => e.dialects.map((d: any) => d.name));
    const commonDialects = allDialects.filter((d: string) => 
      entries.every(e => e.dialects.map((dia: any) => dia.name).includes(d))
    );
    
    if (commonDialects.length > 0) {
      commonalities.push(`Shared dialects: ${commonDialects.join(', ')}`);
    }

    return commonalities;
  }

  private findCrossEntryDifferences(entries: any[]): string[] {
    const differences: string[] = [];

    if (entries.length === 0) return differences;

    // Check for different word forms
    const wordForms = entries.map(e => e.kurdishWord);
    if (new Set(wordForms).size > 1) {
      differences.push(`Different word forms: ${wordForms.join(', ')}`);
    }

    // Check for different dialect coverage
    const dialectCounts = entries.map(e => e.dialects.length);
    if (new Set(dialectCounts).size > 1) {
      differences.push(`Different dialect coverage: ${dialectCounts.join(', ')} dialects per entry`);
    }

    return differences;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(
            dp[i - 1][j],
            dp[i][j - 1],
            dp[i - 1][j - 1]
          );
        }
      }
    }

    return dp[m][n];
  }

  private findCommonPrefix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.substring(0, i);
  }

  private findCommonSuffix(str1: string, str2: string): string {
    let i = 0;
    while (i < str1.length && i < str2.length && 
           str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
      i++;
    }
    return str1.substring(str1.length - i);
  }
}

// Export singleton instance
export const lexicalComparator = new LexicalComparator();
