/**
 * Central reader for all locally-stored learning content.
 *
 * IMPORTANT: This is the ONLY place in the codebase that should read
 * data/<dialect>/{words,phrases,grammar}.json. No learning content is
 * ever hardcoded or fetched from a database — everything comes from
 * these JSON files, exactly as documented in data/FORMAT.md.
 *
 * Files are read from disk on each call in development (so edits show
 * up immediately, per FORMAT.md's instructions), and cached in memory
 * in production to avoid repeated disk I/O on every request.
 */

import fs from 'fs';
import path from 'path';
import type {
  Dialect,
  WordEntry,
  PhraseEntry,
  GrammarEntry,
  LearnableCard,
  ContentKind,
} from '@/types/content';
import { DIALECTS, isDialect } from '@/types/content';

const DATA_ROOT = path.join(process.cwd(), 'data');

type ContentFile = 'words' | 'phrases' | 'grammar';

// In-memory cache, keyed by "<dialect>/<file>". Disabled in development
// so content edits are reflected immediately without a server restart.
const cache = new Map<string, unknown>();
const CACHE_ENABLED = process.env.NODE_ENV === 'production';

function readJsonFile<T>(dialect: Dialect, file: ContentFile): T[] {
  const cacheKey = `${dialect}/${file}`;

  if (CACHE_ENABLED && cache.has(cacheKey)) {
    return cache.get(cacheKey) as T[];
  }

  const filePath = path.join(DATA_ROOT, dialect, `${file}.json`);

  if (!fs.existsSync(filePath)) {
    // Missing content file is not a hard error — return an empty list so
    // the UI can render an "no content yet" state instead of crashing.
    return [];
  }

  const raw = fs.readFileSync(filePath, 'utf-8');

  let parsed: T[];
  try {
    parsed = JSON.parse(raw) as T[];
  } catch (err) {
    throw new Error(
      `Invalid JSON in data/${dialect}/${file}.json: ${(err as Error).message}`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`data/${dialect}/${file}.json must contain a JSON array`);
  }

  if (CACHE_ENABLED) {
    cache.set(cacheKey, parsed);
  }

  return parsed;
}

// ============================================================================
// Public readers
// ============================================================================

export function getWords(dialect: Dialect): WordEntry[] {
  return readJsonFile<WordEntry>(dialect, 'words');
}

export function getPhrases(dialect: Dialect): PhraseEntry[] {
  return readJsonFile<PhraseEntry>(dialect, 'phrases');
}

export function getGrammar(dialect: Dialect): GrammarEntry[] {
  return readJsonFile<GrammarEntry>(dialect, 'grammar');
}

export function getWordById(dialect: Dialect, id: string): WordEntry | undefined {
  return getWords(dialect).find((w) => w.id === id);
}

export function getPhraseById(dialect: Dialect, id: string): PhraseEntry | undefined {
  return getPhrases(dialect).find((p) => p.id === id);
}

export function getGrammarById(dialect: Dialect, id: string): GrammarEntry | undefined {
  return getGrammar(dialect).find((g) => g.id === id);
}

/**
 * All dialects' words/phrases/grammar, for admin/overview screens.
 */
export function getAllDialectsContent() {
  return DIALECTS.map((dialect) => ({
    dialect,
    words: getWords(dialect),
    phrases: getPhrases(dialect),
    grammar: getGrammar(dialect),
  }));
}

/**
 * Words + phrases combined into a single flat list of "learnable cards",
 * used by the quiz and flashcard / SRS systems. Grammar entries are
 * deliberately excluded — they're reference material, not quizzable
 * atomic facts the way a single word or phrase is.
 */
export function getLearnableCards(dialect: Dialect): LearnableCard[] {
  const words: LearnableCard[] = getWords(dialect).map((w) => ({
    id: w.id,
    kind: 'word' as ContentKind,
    dialect,
    kurdish: w.kurdish,
    transliteration: w.transliteration,
    persian: w.persian,
    english: w.english,
    category: w.category,
    difficulty: w.difficulty,
    tags: w.tags,
  }));

  const phrases: LearnableCard[] = getPhrases(dialect).map((p) => ({
    id: p.id,
    kind: 'word' as ContentKind, // overwritten below; kept for type inference
    dialect,
    kurdish: p.kurdish,
    transliteration: p.transliteration,
    persian: p.persian,
    english: p.english,
    category: p.category,
    difficulty: p.difficulty,
    tags: p.tags,
  }));
  phrases.forEach((p) => (p.kind = 'phrase'));

  return [...words, ...phrases];
}

export function getLearnableCardById(
  dialect: Dialect,
  id: string
): LearnableCard | undefined {
  return getLearnableCards(dialect).find((c) => c.id === id);
}

/**
 * Distinct categories present across words + phrases for a dialect,
 * useful for building filter UIs without hardcoding category lists.
 */
export function getCategories(dialect: Dialect): string[] {
  const categories = new Set<string>();
  getWords(dialect).forEach((w) => categories.add(w.category));
  getPhrases(dialect).forEach((p) => categories.add(p.category));
  return Array.from(categories).sort();
}

/**
 * Distinct tags present across words + phrases for a dialect.
 */
export function getTags(dialect: Dialect): string[] {
  const tags = new Set<string>();
  getWords(dialect).forEach((w) => w.tags?.forEach((t) => tags.add(t)));
  getPhrases(dialect).forEach((p) => p.tags?.forEach((t) => tags.add(t)));
  return Array.from(tags).sort();
}

export function clearContentCache(): void {
  cache.clear();
}

export { isDialect };

// Mapping between an ID prefix (e.g. "sor-w-001" -> "sor") and the dialect
// folder name it lives in. Mirrors the prefixes documented in FORMAT.md.
const ID_PREFIX_TO_DIALECT: Record<string, Dialect> = {
  sor: 'sorani',
  kur: 'kurmanji',
  bad: 'bahdini',
  kal: 'kalhory',
  lek: 'leki',
  haw: 'hawrami',
  jaf: 'jafi',
};

/**
 * Given a content id like "sor-w-001", "kur-p-002" or "bad-g-001",
 * returns the dialect it belongs to, or undefined if the prefix is
 * unrecognized.
 */
export function dialectFromId(id: string): Dialect | undefined {
  const prefix = id.split('-')[0];
  return ID_PREFIX_TO_DIALECT[prefix];
}
