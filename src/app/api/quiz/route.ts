import { NextRequest, NextResponse } from 'next/server';
import { getWords, DIALECTS } from '@/lib/content/reader';
import type { Dialect, Word } from '@/types/content';

export interface QuizQuestion {
  id: string;
  wordId: string;
  kurdish: string;
  transliteration: string;
  correctAnswer: string;
  options: string[];
  dialect: Dialect;
  category: string;
  difficulty: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestion(word: Word, allWords: Word[], lang: 'persian' | 'english'): QuizQuestion {
  const correct = lang === 'persian' ? word.persian : word.english;
  // ۳ گزینه اشتباه تصادفی از همان گویش
  const distractors = shuffle(
    allWords
      .filter((w) => w.id !== word.id)
      .map((w) => (lang === 'persian' ? w.persian : w.english)),
  ).slice(0, 3);

  const options = shuffle([correct, ...distractors]);

  return {
    id: `q-${word.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    wordId: word.id,
    kurdish: word.kurdish,
    transliteration: word.transliteration,
    correctAnswer: correct,
    options,
    dialect: word.dialect,
    category: word.category,
    difficulty: word.difficulty,
  };
}

// GET /api/quiz?dialect=sorani&count=10&lang=persian&category=greetings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dialectParam = searchParams.get('dialect') as Dialect | null;
    const dialect: Dialect =
      dialectParam && DIALECTS.includes(dialectParam) ? dialectParam : 'sorani';
    const count = Math.min(50, Math.max(1, parseInt(searchParams.get('count') ?? '10')));
    const lang = searchParams.get('lang') === 'english' ? 'english' : 'persian';
    const category = searchParams.get('category') ?? undefined;

    let words = getWords(dialect);
    if (category) words = words.filter((w) => w.category === category);

    if (words.length < 4) {
      return NextResponse.json(
        { error: 'داده کافی برای ساخت quiz وجود ندارد (حداقل ۴ کلمه لازم است)' },
        { status: 400 },
      );
    }

    const selected = shuffle(words).slice(0, count);
    const questions = selected.map((w) => makeQuestion(w, words, lang));

    return NextResponse.json({ questions, dialect, total: questions.length });
  } catch (error) {
    console.error('Quiz API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
