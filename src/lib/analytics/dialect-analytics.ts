import { db } from '@/db';
import { vocabulary, dialects, dialectVariants, lexicalMeanings, linguisticAnnotations, dialectAuditLogs } from '@/db/schema';
import { eq, count, desc, sql } from 'drizzle-orm';
import type { DialectAnalytics, SearchUsageMetrics, UserDialectActivity } from '@/types/dialects';

/**
 * Analytics and Reporting Service for Dialect Comparison Platform
 * 
 * This service provides comprehensive analytics on dialect usage, search patterns,
 * user activity, and system performance metrics.
 */

export class DialectAnalyticsService {
  /**
   * Get analytics for a specific dialect
   */
  async getDialectAnalytics(dialectId: string): Promise<DialectAnalytics | null> {
    // Get dialect info
    const [dialect] = await db
      .select()
      .from(dialects)
      .where(eq(dialects.id, dialectId))
      .limit(1);

    if (!dialect) {
      return null;
    }

    // Count total entries for this dialect
    const [entryCount] = await db
      .select({ count: count() })
      .from(dialectVariants)
      .where(eq(dialectVariants.dialectId, dialectId));

    // Count total variants
    const [variantCount] = await db
      .select({ count: count() })
      .from(dialectVariants)
      .where(eq(dialectVariants.dialectId, dialectId));

    // Count total annotations for entries in this dialect
    const [annotationCount] = await db
      .select({ count: count() })
      .from(linguisticAnnotations)
      .innerJoin(dialectVariants, eq(linguisticAnnotations.entryId, dialectVariants.entryId))
      .where(eq(dialectVariants.dialectId, dialectId));

    // Search count (placeholder - would need search logs table)
    const searchCount = 0;

    return {
      dialectId: dialect.id,
      dialectName: dialect.name,
      totalEntries: entryCount.count,
      totalVariants: variantCount.count,
      totalAnnotations: annotationCount.count,
      searchCount,
      lastUpdated: dialect.updatedAt as any,
    };
  }

  /**
   * Get analytics for all dialects
   */
  async getAllDialectsAnalytics(): Promise<DialectAnalytics[]> {
    const allDialects = await db.select().from(dialects);

    const analytics = await Promise.all(
      allDialects.map(dialect => this.getDialectAnalytics(dialect.id))
    );

    return analytics.filter((a): a is DialectAnalytics => a !== null);
  }

  /**
   * Get search usage metrics
   */
  async getSearchUsageMetrics(timeRange: 'day' | 'week' | 'month' = 'week'): Promise<SearchUsageMetrics> {
    // Placeholder implementation - would need search logs table
    // For now, return mock data structure
    
    return {
      totalSearches: 0,
      uniqueSearchTerms: 0,
      averageResultsPerSearch: 0,
      topSearchTerms: [],
      searchesByDialect: [],
    };
  }

  /**
   * Get user dialect activity
   */
  async getUserDialectActivity(userId: string): Promise<UserDialectActivity[]> {
    // Placeholder implementation - would need user activity logs
    // For now, return empty array
    
    return [];
  }

  /**
   * Get system-wide statistics
   */
  async getSystemStatistics() {
    // Total vocabulary entries
    const [totalEntries] = await db
      .select({ count: count() })
      .from(vocabulary);

    // Total dialects
    const [totalDialects] = await db
      .select({ count: count() })
      .from(dialects);

    // Total dialect variants
    const [totalVariants] = await db
      .select({ count: count() })
      .from(dialectVariants);

    // Total lexical meanings
    const [totalMeanings] = await db
      .select({ count: count() })
      .from(lexicalMeanings);

    // Total linguistic annotations
    const [totalAnnotations] = await db
      .select({ count: count() })
      .from(linguisticAnnotations);

    // Entries by part of speech
    const entriesByPOS = await db
      .select({
        partOfSpeech: vocabulary.partOfSpeech,
        count: count(),
      })
      .from(vocabulary)
      .where(sql`${vocabulary.partOfSpeech} IS NOT NULL`)
      .groupBy(vocabulary.partOfSpeech)
      .orderBy(desc(count()));

    // Entries by difficulty level
    const entriesByDifficulty = await db
      .select({
        difficultyLevel: vocabulary.difficultyLevel,
        count: count(),
      })
      .from(vocabulary)
      .where(sql`${vocabulary.difficultyLevel} IS NOT NULL`)
      .groupBy(vocabulary.difficultyLevel)
      .orderBy(desc(count()));

    return {
      totalEntries: totalEntries.count,
      totalDialects: totalDialects.count,
      totalVariants: totalVariants.count,
      totalMeanings: totalMeanings.count,
      totalAnnotations: totalAnnotations.count,
      entriesByPOS,
      entriesByDifficulty,
    };
  }

  /**
   * Get audit log statistics
   */
  async getAuditLogStatistics(timeRange: 'day' | 'week' | 'month' = 'week') {
    // Total audit logs
    const [totalLogs] = await db
      .select({ count: count() })
      .from(dialectAuditLogs);

    // Logs by action type
    const logsByAction = await db
      .select({
        actionType: dialectAuditLogs.actionType,
        count: count(),
      })
      .from(dialectAuditLogs)
      .groupBy(dialectAuditLogs.actionType)
      .orderBy(desc(count()));

    // Recent activity
    const recentActivity = await db
      .select()
      .from(dialectAuditLogs)
      .orderBy(desc(dialectAuditLogs.createdAt))
      .limit(10);

    return {
      totalLogs: totalLogs.count,
      logsByAction,
      recentActivity,
    };
  }

  /**
   * Generate analytics report
   */
  async generateAnalyticsReport() {
    const systemStats = await this.getSystemStatistics();
    const dialectAnalytics = await this.getAllDialectsAnalytics();
    const auditStats = await this.getAuditLogStatistics();

    return {
      system: systemStats,
      dialects: dialectAnalytics,
      audit: auditStats,
      generatedAt: new Date(),
    };
  }
}

// Export singleton instance
export const dialectAnalyticsService = new DialectAnalyticsService();
