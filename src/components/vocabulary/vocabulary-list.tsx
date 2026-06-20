'use client';

import { VocabularyCard } from './vocabulary-card';

interface VocabularyListProps {
  vocabulary: Array<{
    id: string;
    kurdishWord: string;
    persianTranslation: string;
    englishTranslation?: string;
    pronunciation?: string;
    difficultyLevel?: string;
    dialects?: Array<{ dialect: { name: string; code: string } }>;
    tags?: Array<{ tag: { name: string; slug: string } }>;
  }>;
  savedVocabulary?: Set<string>;
  favoriteVocabulary?: Set<string>;
  onSave?: (id: string) => void;
  onFavorite?: (id: string) => void;
  onPlayAudio?: (id: string) => void;
  loading?: boolean;
}

export function VocabularyList({
  vocabulary,
  savedVocabulary = new Set(),
  favoriteVocabulary = new Set(),
  onSave,
  onFavorite,
  onPlayAudio,
  loading = false,
}: VocabularyListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-48 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (vocabulary.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No vocabulary found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vocabulary.map((vocab) => (
        <VocabularyCard
          key={vocab.id}
          vocabulary={vocab}
          isSaved={savedVocabulary.has(vocab.id)}
          isFavorite={favoriteVocabulary.has(vocab.id)}
          onSave={() => onSave?.(vocab.id)}
          onFavorite={() => onFavorite?.(vocab.id)}
          onPlayAudio={() => onPlayAudio?.(vocab.id)}
        />
      ))}
    </div>
  );
}
