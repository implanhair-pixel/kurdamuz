/**
 * Types for locally-stored learning content (/data folder).
 *
 * These mirror the JSON shapes documented in data/FORMAT.md exactly.
 * No learning content is ever hardcoded in the database or in code —
 * everything described here is read from JSON files on disk at request time.
 */

export type Dialect =
  | 'sorani'
  | 'kurmanji'
  | 'bahdini'
  | 'kalhory'
  | 'leki'
  | 'hawrami'
  | 'jafi';

export const DIALECTS: Dialect[] = [
  'sorani',
  'kurmanji',
  'bahdini',
  'kalhory',
  'leki',
  'hawrami',
  'jafi',
];

export function isDialect(value: string): value is Dialect {
  return DIALECTS.includes(value as Dialect);
}

// ============================================================================
// words.json
// ============================================================================

export type WordCategory =
  | 'greetings'
  | 'numbers'
  | 'animals'
  | 'food'
  | 'family'
  | 'body'
  | 'colors'
  | 'time'
  | 'places'
  | 'verbs'
  | 'adjectives'
  | 'nature'
  | 'daily';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'interjection'
  | 'pronoun'
  | 'preposition';

export interface WordExample {
  sentence: string;
  transliteration: string;
  translation: string;
}

export interface WordEntry {
  id: string;
  kurdish: string;
  transliteration: string;
  persian: string;
  english?: string;
  category: WordCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  partOfSpeech?: PartOfSpeech;
  examples?: WordExample[];
  audioUrl?: string | null;
  imageUrl?: string | null;
  tags?: string[];
}

// ============================================================================
// phrases.json
// ============================================================================

export type PhraseCategory =
  | 'greetings'
  | 'shopping'
  | 'travel'
  | 'restaurant'
  | 'emergency'
  | 'socializing'
  | 'work'
  | 'family'
  | 'directions'
  | 'idioms';

export type PhraseType = 'statement' | 'question' | 'idiom' | 'proverb' | 'command';
export type PhraseContext = 'formal' | 'informal' | 'written' | 'spoken';

export interface PhraseResponse {
  kurdish: string;
  transliteration: string;
  persian: string;
}

export interface PhraseEntry {
  id: string;
  kurdish: string;
  transliteration: string;
  persian: string;
  english?: string;
  category: PhraseCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  type?: PhraseType;
  context?: PhraseContext;
  response?: PhraseResponse | null;
  notes?: string | null;
  audioUrl?: string | null;
  tags?: string[];
}

// ============================================================================
// grammar.json
// ============================================================================

export type GrammarCategory =
  | 'pronouns'
  | 'verbs'
  | 'nouns'
  | 'adjectives'
  | 'tenses'
  | 'sentence-structure'
  | 'negation'
  | 'questions'
  | 'cases';

export interface GrammarExplanation {
  persian: string;
  english?: string;
}

export interface GrammarRuleExample {
  kurdish: string;
  transliteration: string;
  persian: string;
}

export interface GrammarRule {
  rule: string;
  example: GrammarRuleExample;
}

export interface GrammarTable {
  headers: string[];
  rows: string[][];
}

export interface GrammarExercise {
  question: string;
  answer: string;
  hint?: string;
}

export interface GrammarEntry {
  id: string;
  title: string;
  titleEn?: string;
  category: GrammarCategory;
  difficulty: 1 | 2 | 3 | 4 | 5;
  explanation: GrammarExplanation;
  rules: GrammarRule[];
  table?: GrammarTable | null;
  exercises?: GrammarExercise[];
  tags?: string[];
}

// ============================================================================
// Generic learnable card union (used by quiz/flashcard/SRS systems)
// ============================================================================

export type ContentKind = 'word' | 'phrase';

export interface LearnableCard {
  id: string;
  kind: ContentKind;
  dialect: Dialect;
  kurdish: string;
  transliteration: string;
  persian: string;
  english?: string;
  category: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
}
