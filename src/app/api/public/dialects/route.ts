import { NextResponse } from 'next/server';
import { DIALECTS } from '@/types/content';
import { getWords, getPhrases, getGrammar } from '@/lib/content/reader';

// GET /api/public/dialects — fixed list of 7 supported dialects with basic
// content counts, served entirely from Local Data (data/<dialect>/).
// Dialects are static and never sourced from any database; this also
// removes an unnecessary Supabase dependency.
export async function GET() {
  try {
    const dialects = DIALECTS.map((code) => ({
      code,
      name: code,
      wordCount: getWords(code).length,
      phraseCount: getPhrases(code).length,
      grammarCount: getGrammar(code).length,
    }));

    return NextResponse.json({ dialects });
  } catch (error) {
    console.error('Dialects API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
