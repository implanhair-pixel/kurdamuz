/**
 * Migration Script: Migrate existing vocabulary progress to SRS schema
 * 
 * This script migrates data from the old vocabulary progress tables
 * (vocabularyProgress, reviewSessions, reviewAttempts) to the new SRS schema
 * (srsItems, srsSchedules, srsReviews).
 * 
 * Usage:
 *   npx tsx src/db/migrations/migrate-vocabulary-to-srs.ts
 */

import { db } from '@/db';
import { 
  vocabularyProgress, 
  reviewSessions, 
  reviewAttempts,
  srsItems,
  srsSchedules,
  srsReviews,
} from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { calculateNextReviewDate, initializeSchedule } from '@/lib/srs/sm2-algorithm';

interface VocabularyProgressWithReviews {
  id: string;
  userId: string;
  vocabularyId: string;
  status: string;
  lastReviewedAt: Date | null;
  reviewAttempts: Array<{
    responseQuality: number;
    reviewedAt: Date;
  }>;
}

async function migrateVocabularyToSRS() {
  console.log('Starting migration of vocabulary progress to SRS schema...');

  try {
    // Get all vocabulary progress records
    const allProgress = await db.select().from(vocabularyProgress);
    console.log(`Found ${allProgress.length} vocabulary progress records to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const progress of allProgress) {
      try {
        // Check if SRS item already exists for this vocabulary
        const [existingSrsItem] = await db
          .select()
          .from(srsItems)
          .where(
            and(
              eq(srsItems.userId, progress.userId),
              eq(srsItems.contentId, progress.vocabularyId),
              eq(srsItems.contentType, 'vocabulary')
            )
          )
          .limit(1);

        if (existingSrsItem) {
          console.log(`Skipping ${progress.vocabularyId} - SRS item already exists`);
          skippedCount++;
          continue;
        }

        // Get review attempts for this vocabulary progress
        const attempts = await db
          .select()
          .from(reviewAttempts)
          .where(eq(reviewAttempts.vocabularyId, progress.vocabularyId))
          .orderBy(desc(reviewAttempts.reviewedAt));

        // Determine status based on masteryScore
        let status = 'learning';
        if ((progress.masteryScore ?? 0) >= 90) {
          status = 'mastery';
        } else if ((progress.masteryScore ?? 0) >= 70) {
          status = 'retention';
        } else if ((progress.masteryScore ?? 0) >= 50) {
          status = 'reinforcement';
        }

        // Create SRS item
        const [srsItem] = await db
          .insert(srsItems)
          .values({
            userId: progress.userId,
            contentType: 'vocabulary',
            contentId: progress.vocabularyId,
            status,
            createdAt: progress.lastReviewedAt || new Date(),
            updatedAt: new Date(),
          })
          .returning();

        // Initialize schedule
        const initialSchedule = initializeSchedule();
        let nextReviewAt = calculateNextReviewDate(initialSchedule.interval);

        // If there are review attempts, calculate schedule based on history
        if (attempts.length > 0) {
          // Use the most recent review quality to calculate initial schedule
          const mostRecent = attempts[0];
          const quality = mostRecent.responseQuality;
          
          // Calculate initial interval based on quality
          if (quality >= 3) {
            initialSchedule.interval = quality >= 4 ? 6 : 1;
            initialSchedule.repetitions = quality >= 4 ? 2 : 1;
          } else {
            initialSchedule.interval = 1;
            initialSchedule.repetitions = 0;
          }
          
          nextReviewAt = calculateNextReviewDate(initialSchedule.interval);
        }

        // Create schedule
        await db.insert(srsSchedules).values({
          srsItemId: srsItem.id,
          nextReviewAt,
          currentInterval: initialSchedule.interval,
          easeFactor: initialSchedule.easeFactor.toString(),
          repetitionCount: initialSchedule.repetitions,
          stabilityScore: '0',
          difficultyScore: '0',
          updatedAt: new Date(),
        });

        // Migrate review attempts to SRS reviews
        for (const attempt of attempts) {
          await db.insert(srsReviews).values({
            userId: progress.userId,
            srsItemId: srsItem.id,
            reviewQuality: attempt.responseQuality,
            responseTime: 0, // Not tracked in old schema
            reviewedAt: attempt.reviewedAt,
          });
        }

        console.log(`Migrated vocabulary ${progress.vocabularyId} for user ${progress.userId}`);
        migratedCount++;
      } catch (error) {
        console.error(`Error migrating vocabulary ${progress.vocabularyId}:`, error);
        errorCount++;
      }
    }

    console.log('\nMigration complete!');
    console.log(`- Migrated: ${migratedCount}`);
    console.log(`- Skipped: ${skippedCount}`);
    console.log(`- Errors: ${errorCount}`);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateVocabularyToSRS()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
