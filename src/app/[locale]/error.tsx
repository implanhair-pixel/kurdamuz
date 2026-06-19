'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LocaleError({ error, reset }: ErrorProps) {
  const t = useTranslations('error');

  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{t('title')}</h1>
        <p className="text-slate-500 mb-8">
          {t('description')}
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-4 font-mono">
            {t('errorCode')}: {error.digest}
          </p>
        )}
        <button
          onClick={reset}
          className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  );
}
