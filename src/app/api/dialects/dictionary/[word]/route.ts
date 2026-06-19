import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { vocabulary, dialectVariants, lexicalMeanings, linguisticAnnotations, lexicalRelationships, vocabularyExamples, dialects } from '@/db/schema';
import { eq, or, ilike } from 'drizzle-orm';
import type { DictionaryEntry } from '@/types/dialects';

// GET /api/dialects/dictionary/[word] - Get dictionary entry for a word
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  const { word: rawWord } = await params;
  try {
    const word = decodeURIComponent(rawWord);

    // Find the vocabulary entry
    const [entry] = await db
      .select()
      .from(vocabulary)
      .where(
        or(
          eq(vocabulary.kurdishWord, word),
          eq(vocabulary.normalizedForm, word),
          ilike(vocabulary.kurdishWord, `${word}%`)
        )
      )
      .limit(1);

    if (!entry) {
      return NextResponse.json(
        { error: 'Word not found' },
        { status: 404 }
      );
    }

    // Get dialect variants
    const variants = await db
      .select({
        id: dialectVariants.id,
        variantForm: dialectVariants.variantForm,
        phoneticForm: dialectVariants.phoneticForm,
        usageFrequency: dialectVariants.usageFrequency,
        dialectId: dialectVariants.dialectId,
      })
      .from(dialectVariants)
      .where(eq(dialectVariants.entryId, entry.id));

    // Get meanings
    const meanings = await db
      .select()
      .from(lexicalMeanings)
      .where(eq(lexicalMeanings.entryId, entry.id));

    // Get linguistic annotations
    const annotations = await db
      .select()
      .from(linguisticAnnotations)
      .where(eq(linguisticAnnotations.entryId, entry.id));

    // Get lexical relationships
    const relationships = await db
      .select()
      .from(lexicalRelationships)
      .where(eq(lexicalRelationships.sourceEntryId, entry.id));

    // Get example sentences with dialect information
    const examples = await db
      .select({
        sentence: vocabularyExamples.kurdishSentence,
        translation: vocabularyExamples.persianTranslation,
        englishTranslation: vocabularyExamples.englishTranslation,
        sourceReference: vocabularyExamples.sourceReference,
        dialectId: vocabularyExamples.dialectId,
      })
      .from(vocabularyExamples)
      .where(eq(vocabularyExamples.vocabularyId, entry.id));

    // Enrich examples with dialect information
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
          sentence: example.sentence,
          translation: example.translation,
          sourceReference: example.sourceReference,
          dialect,
        };
      })
    );

    // Enrich variants with dialect information
    const enrichedVariants = await Promise.all(
      variants.map(async (variant) => {
        const [dialect] = await db
          .select()
          .from(dialects)
          .where(eq(dialects.id, variant.dialectId))
          .limit(1);
        return {
          ...variant,
          dialect,
        };
      })
    );

    // Build dictionary entry
    const dictionaryEntry: DictionaryEntry = {
      id: entry.id,
      lemma: entry.kurdishWord,
      normalizedForm: entry.normalizedForm || undefined,
      pronunciation: entry.pronunciation || undefined,
      partOfSpeech: entry.partOfSpeech || undefined,
      meanings: meanings.map(m => ({
        id: m.id,
        entryId: m.entryId,
        definition: m.definition,
        semanticDomain: m.semanticDomain || undefined,
        difficultyLevel: m.difficultyLevel || undefined,
        createdAt: m.createdAt ?? new Date(),
        updatedAt: m.updatedAt ?? new Date(),
      })) as any,
      dialectVariants: enrichedVariants as any,
      exampleSentences: enrichedExamples as any,
      annotations: annotations.map(a => ({
        id: a.id,
        entryId: a.entryId,
        annotationType: a.annotationType as any,
        annotationData: a.annotationData,
        createdAt: a.createdAt ?? new Date(),
        updatedAt: a.updatedAt ?? new Date(),
      })) as any,
      relatedTerms: relationships.map(r => ({
        id: r.id,
        sourceEntryId: r.sourceEntryId,
        targetEntryId: r.targetEntryId,
        relationshipType: r.relationshipType as any,
        createdAt: r.createdAt ?? new Date(),
      })),
      etymology: entry.etymology || undefined,
      rootForm: entry.rootForm || undefined,
    };

    return NextResponse.json({ entry: dictionaryEntry }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dictionary entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dictionary entry' },
      { status: 500 }
    );
  }
}
