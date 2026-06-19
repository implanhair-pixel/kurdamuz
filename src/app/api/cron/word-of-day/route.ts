import { NextResponse } from 'next/server';
import { validateCronSecret } from '@/lib/cron-validation';
import { db } from '@/db';
import { vocabulary } from '@/db/schema';
import { sql, and, desc, isNotNull } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as Sentry from '@sentry/nextjs';

export async function GET() {
  const startTime = Date.now();
  
  try {
    await validateCronSecret();
    
    Sentry.captureMessage('Word of the Day publication started', 'info');
    console.log('Word of the Day publication started');
    
    // Select random word from vocabulary (not featured in last 30 days)
    // Words with translations, examples, and audio are prioritized
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [word] = await db.execute(sql`
      SELECT id, kurdish_word, persian_translation, english_translation
      FROM vocabulary
      WHERE 
        persian_translation IS NOT NULL
        AND english_translation IS NOT NULL
        AND audio_url IS NOT NULL
        AND (id NOT IN (
          SELECT vocabulary_id 
          FROM word_of_day_history 
          WHERE published_at >= ${thirtyDaysAgo}
        ))
      ORDER BY RANDOM()
      LIMIT 1
    `);
    
    if (!word) {
      console.log('No eligible word found for Word of the Day');
      Sentry.captureMessage('No eligible word found for Word of the Day', 'warning');
      return NextResponse.json({
        success: false,
        message: 'No eligible word found',
        duration: Date.now() - startTime,
      });
    }
    
    // Publish to database (word_of_day table)
    await db.execute(sql`
      INSERT INTO word_of_day (id, vocabulary_id, published_at, word_data)
      VALUES (${randomUUID()}, ${word.id}, NOW(), ${JSON.stringify(word)})
    `);
    
    // Track in history
    await db.execute(sql`
      INSERT INTO word_of_day_history (vocabulary_id, published_at)
      VALUES (${word.id}, NOW())
    `);
    
    console.log(`Word of the Day published. Word ID: ${word.id} (${word.kurdish_word}) in ${Date.now() - startTime}ms`);
    Sentry.captureMessage(`Word of the Day published: ${word.kurdish_word} in ${Date.now() - startTime}ms`, 'info');
    
    return NextResponse.json({
      success: true,
      message: 'Word of the Day published',
      wordId: word.id,
      word: word.kurdish_word,
      duration: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Word of the Day error:', error);
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to publish Word of the Day' },
      { status: 500 }
    );
  }
}
