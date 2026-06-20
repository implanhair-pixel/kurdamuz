'use client';

import { useState, useEffect, useCallback } from 'react';
import type { QuizQuestion } from '@/app/api/quiz/route';
import type { Dialect } from '@/types/content';

type Phase = 'setup' | 'loading' | 'question' | 'feedback' | 'summary';

const DIALECT_LABELS: Record<Dialect, string> = {
  sorani: 'سورانی',
  kurmanji: 'کرمانجی',
  bahdini: 'بادینی',
  kalhory: 'کلهری',
  leki: 'لکی',
  hawrami: 'هورامی',
  jafi: 'جافی',
};

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [dialect, setDialect] = useState<Dialect>('sorani');
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<{ correct: boolean; wordId: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = useCallback(async () => {
    setPhase('loading');
    setError(null);
    try {
      const res = await fetch(`/api/quiz?dialect=${dialect}&count=${count}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'خطا در بارگذاری سؤالات');
      setQuestions(data.questions);
      setCurrent(0);
      setResults([]);
      setSelected(null);
      setPhase('question');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'خطای ناشناخته');
      setPhase('setup');
    }
  }, [dialect, count]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (selected !== null) return;
      setSelected(option);
      const q = questions[current];
      const correct = option === q.correctAnswer;
      setResults((prev) => [...prev, { correct, wordId: q.wordId }]);
      setPhase('feedback');
    },
    [selected, questions, current],
  );

  const handleNext = useCallback(() => {
    if (current + 1 >= questions.length) {
      setPhase('summary');
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
      setPhase('question');
    }
  }, [current, questions.length]);

  const correctCount = results.filter((r) => r.correct).length;

  if (phase === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">آزمون کردی</h1>
          <p className="text-gray-500 text-center mb-8">گویش و تعداد سؤال را انتخاب کنید</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">گویش</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['sorani', 'kurmanji', 'bahdini', 'kalhory', 'leki', 'hawrami', 'jafi'] as Dialect[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDialect(d)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                      dialect === d
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    {DIALECT_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تعداد سؤال: {count}
              </label>
              <input
                type="range"
                min={5}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>۵</span>
                <span>۲۰</span>
              </div>
            </div>
          </div>

          <button
            onClick={startQuiz}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors"
          >
            شروع آزمون
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">در حال بارگذاری سؤالات...</p>
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-bold mb-2">نتیجه آزمون</h2>
          <p className="text-5xl font-bold text-indigo-600 mb-2">{pct}٪</p>
          <p className="text-gray-600 mb-8">
            {correctCount} از {questions.length} سؤال درست
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPhase('setup')}
              className="py-2 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              آزمون جدید
            </button>
            <button
              onClick={startQuiz}
              className="py-2 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
            >
              تکرار همین
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];
  const isCorrect = selected === q?.correctAnswer;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-lg w-full">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 bg-gray-100 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${((current) / questions.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {current + 1} / {questions.length}
          </span>
        </div>

        {/* سؤال */}
        <div className="text-center mb-8">
          <p className="text-sm text-gray-400 mb-1">{DIALECT_LABELS[q.dialect]} — {q.category}</p>
          <div className="text-5xl font-bold mb-2">{q.kurdish}</div>
          <div className="text-gray-400 text-sm font-mono">{q.transliteration}</div>
          <p className="text-gray-600 mt-4 text-sm">معنی این کلمه چیست؟</p>
        </div>

        {/* گزینه‌ها */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {q.options.map((opt) => {
            let cls = 'p-3 rounded-xl border text-sm font-medium text-center transition-all ';
            if (selected === null) {
              cls += 'border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer';
            } else if (opt === q.correctAnswer) {
              cls += 'border-green-500 bg-green-50 text-green-800';
            } else if (opt === selected && !isCorrect) {
              cls += 'border-red-500 bg-red-50 text-red-800';
            } else {
              cls += 'border-gray-100 text-gray-400';
            }
            return (
              <button key={opt} className={cls} onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            );
          })}
        </div>

        {/* فیدبک */}
        {phase === 'feedback' && (
          <div className={`rounded-xl p-4 mb-4 ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            <p className="font-bold">{isCorrect ? '✓ درست!' : '✗ اشتباه'}</p>
            {!isCorrect && (
              <p className="text-sm mt-1">جواب درست: <span className="font-bold">{q.correctAnswer}</span></p>
            )}
            <button
              onClick={handleNext}
              className="mt-3 w-full py-2 rounded-lg bg-white border font-medium hover:bg-gray-50"
            >
              {current + 1 >= questions.length ? 'مشاهده نتیجه' : 'سؤال بعدی'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
