'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import type { Dialect, GrammarEntry, WordEntry } from '@/types/content';

const DIALECT_ORDER: Dialect[] = ['sorani', 'kurmanji', 'bahdini', 'kalhory', 'leki', 'hawrami', 'jafi'];

type LibraryKind = 'vocabulary' | 'grammar';

type VocabularyItem = WordEntry & { dialect: Dialect };
type GrammarItem = GrammarEntry & { dialect: Dialect };

const DIFFICULTY: Record<number, string> = {
  1: 'beginner',
  2: 'basic',
  3: 'intermediate',
  4: 'advanced',
  5: 'expert',
};

export function ContentLibraryPage({ kind }: { kind: LibraryKind }) {
  const t = useTranslations('library');
  const [items, setItems] = useState<Array<VocabularyItem | GrammarItem>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [dialect, setDialect] = useState<Dialect | 'all'>('all');

  const dialectLabels = useMemo<Record<Dialect, string>>(() => ({
    sorani: t('dialects.sorani'),
    kurmanji: t('dialects.kurmanji'),
    bahdini: t('dialects.bahdini'),
    kalhory: t('dialects.kalhory'),
    leki: t('dialects.leki'),
    hawrami: t('dialects.hawrami'),
    jafi: t('dialects.jafi'),
  }), [t]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ limit: '60' });
      if (query.trim()) params.set('query', query.trim());
      if (dialect !== 'all') params.set('dialect', dialect);

      const res = await fetch(`/api/public/${kind}?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('errors.loadFailed'));
      setItems(data[kind] ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.unknown'));
    } finally {
      setLoading(false);
    }
  }, [dialect, kind, query, t]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load();
    }, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  const title = kind === 'vocabulary' ? t('titles.vocabulary') : t('titles.grammar');
  const description = kind === 'vocabulary' ? t('descriptions.vocabulary') : t('descriptions.grammar');
  const placeholder = kind === 'vocabulary' ? t('searchPlaceholders.vocabulary') : t('searchPlaceholders.grammar');
  const emptyMessage = kind === 'vocabulary' ? t('empty.vocabulary') : t('empty.grammar');

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-lg text-gray-600">{description}</p>
      </header>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <Input
          type="search"
          placeholder={placeholder}
          className="max-w-md"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        <button type="button" onClick={() => setDialect('all')}>
          <Badge variant={dialect === 'all' ? 'default' : 'secondary'}>{t('allDialects')}</Badge>
        </button>
        {DIALECT_ORDER.map((d) => (
          <button key={d} type="button" onClick={() => setDialect(d)}>
            <Badge variant={dialect === d ? 'default' : 'secondary'}>{dialectLabels[d]}</Badge>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-500">{t('loading')}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) =>
            kind === 'vocabulary' ? (
              <VocabularyCard key={`${item.dialect}-${item.id}`} item={item as VocabularyItem} t={t} dialectLabels={dialectLabels} />
            ) : (
              <GrammarCard key={`${item.dialect}-${item.id}`} item={item as GrammarItem} t={t} dialectLabels={dialectLabels} />
            )
          )}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-gray-600">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}

function VocabularyCard({
  item,
  t,
  dialectLabels,
}: {
  item: VocabularyItem;
  t: any;
  dialectLabels: Record<Dialect, string>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{item.kurdish}</CardTitle>
        <CardDescription>{item.transliteration}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div><span className="text-sm text-gray-600">{t('labels.persian')}: </span><span className="font-medium">{item.persian}</span></div>
          {item.english && <div><span className="text-sm text-gray-600">{t('labels.english')}: </span><span className="font-medium">{item.english}</span></div>}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary">{dialectLabels[item.dialect]}</Badge>
            <Badge variant={item.difficulty <= 2 ? 'success' : 'warning'}>{t(`difficulty.${DIFFICULTY[item.difficulty]}`)}</Badge>
            <Badge variant="secondary">{item.category}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GrammarCard({
  item,
  t,
  dialectLabels,
}: {
  item: GrammarItem;
  t: any;
  dialectLabels: Record<Dialect, string>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        {item.titleEn && <CardDescription>{item.titleEn}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm text-gray-700">{item.explanation.persian}</p>
          {item.explanation.english && <p className="text-sm text-gray-500">{item.explanation.english}</p>}
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge variant="secondary">{dialectLabels[item.dialect]}</Badge>
            <Badge variant={item.difficulty <= 2 ? 'success' : 'warning'}>{t(`difficulty.${DIFFICULTY[item.difficulty]}`)}</Badge>
            <Badge variant="secondary">{item.category}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
