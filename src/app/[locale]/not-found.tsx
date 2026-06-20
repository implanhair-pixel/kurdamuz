'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LocaleNotFound() {
  const t = useTranslations('error');
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-10">
        <div className="text-8xl font-bold text-indigo-500 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{t('title')}</h1>
        <p className="text-slate-500 mb-8">
          {t('description')}
        </p>
        <Link
          href="/"
          className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          {t('backToHome')}
        </Link>
      </div>
    </div>
  );
}
