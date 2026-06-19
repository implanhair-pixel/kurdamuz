import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { vocabularyExamples, dialects } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/dialects/examples/[entryId] - Get example sentences for an entry
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  const { entryId } = await params;
  try {
    const searchParams = request.nextUrl.searchParams;
    const dialectId = searchParams.get('dialectId');

    const whereConditions = dialectId
      ? and(eq(vocabularyExamples.vocabularyId, entryId), eq(vocabularyExamples.dialectId, dialectId))
      : eq(vocabularyExamples.vocabularyId, entryId);

    const examples = await db
      .select({
        id: vocabularyExamples.id,
        sentence: vocabularyExamples.kurdishSentence,
        translation: vocabularyExamples.persianTranslation,
        englishTranslation: vocabularyExamples.englishTranslation,
        sourceReference: vocabularyExamples.sourceReference,
        dialectId: vocabularyExamples.dialectId,
      })
      .from(vocabularyExamples)
      .where(whereConditions);

    // Enrich with dialect information
    const enrichedExamples = await Promise.all(
      examples.map(async (example) => {
        let dialect = null;
        if (example.dialectId) {
          const [dialectData] = await db
            .select()
            .from(dialects)
            .where(eq(dialects.id, example.dialectId))
            .limit(1);
          dialect = dialectData;
        }

        return {
          id: example.id,
          sentence: example.sentence,
          translation: example.translation,
          englishTranslation: example.englishTranslation || undefined,
          dialect: dialect || undefined,
          sourceReference: example.sourceReference || undefined,
        };
      })
    );

    return NextResponse.json({ examples: enrichedExamples }, { status: 200 });
  } catch (error) {
    console.error('Error fetching example sentences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch example sentences' },
      { status: 500 }
    );
  }
}
