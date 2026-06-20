import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, numeric, date } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Course categories table (renamed from categories to avoid naming conflicts)
export const courseCategories = pgTable('course_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Courses table
export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').references(() => courseCategories.id),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  dialectId: uuid('dialect_id'),
  difficultyLevel: text('difficulty_level'),
  thumbnailUrl: text('thumbnail_url'),
  isPublished: boolean('is_published').default(false),
  price: integer('price').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Course enrollments table — tracks which users are enrolled in which courses
export const courseEnrollments = pgTable('course_enrollments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  status: text('status').notNull().default('active'), // active|completed|cancelled
  enrolledAt: timestamp('enrolled_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Purchase requests table — manual/offline purchase approval workflow for paid courses
export const purchaseRequests = pgTable('purchase_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('pending'), // pending|approved|rejected
  note: text('note'),
  requestedAt: timestamp('requested_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
  reviewedBy: uuid('reviewed_by'),
});

// Course modules table
export const courseModules = pgTable('course_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  title: text('title').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').default(0),
});

// Lessons table
export const lessons = pgTable('lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').references(() => courseModules.id).notNull(),
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  lessonType: text('lesson_type').notNull(),
  content: jsonb('content').$type<any>(),
  xpReward: integer('xp_reward').default(0),
  estimatedDuration: integer('estimated_duration'),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Lesson assets table
export const lessonAssets = pgTable('lesson_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
  assetType: text('asset_type').notNull(),
  fileUrl: text('file_url').notNull(),
  title: text('title'),
});

// Vocabulary table (Phase 13 extended to match lexical_entries schema)
export const vocabulary = pgTable('vocabulary', {
  id: uuid('id').primaryKey().defaultRandom(),
  kurdishWord: text('kurdish_word').notNull(),
  normalizedForm: text('normalized_form'),
  persianTranslation: text('persian_translation').notNull(),
  englishTranslation: text('english_translation'),
  pronunciation: text('pronunciation'),
  audioUrl: text('audio_url'),
  partOfSpeech: text('part_of_speech'),
  rootForm: text('root_form'),
  etymology: text('etymology'),
  difficultyLevel: text('difficulty_level'),
  frequencyRank: integer('frequency_rank'),
  status: text('status'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Lesson vocabulary junction table
export const lessonVocabulary = pgTable('lesson_vocabulary', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
  vocabularyId: uuid('vocabulary_id').references(() => vocabulary.id).notNull(),
});

// Grammar topics table
export const grammarTopics = pgTable('grammar_topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  difficultyLevel: text('difficulty_level'),
});

// Lesson grammar junction table
export const lessonGrammar = pgTable('lesson_grammar', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
  grammarTopicId: uuid('grammar_topic_id').references(() => grammarTopics.id).notNull(),
});

// Quizzes table
export const quizzes = pgTable('quizzes', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
  title: text('title').notNull(),
  passingScore: integer('passing_score').default(70),
});

// Questions table
export const questions = pgTable('questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  quizId: uuid('quiz_id').references(() => quizzes.id).notNull(),
  questionType: text('question_type').notNull(),
  questionText: text('question_text').notNull(),
  correctAnswer: text('correct_answer').notNull(),
  points: integer('points').default(1),
});

// Question options table
export const questionOptions = pgTable('question_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionId: uuid('question_id').references(() => questions.id).notNull(),
  optionText: text('option_text').notNull(),
  isCorrect: boolean('is_correct').default(false),
});

// User progress table
export const userProgress = pgTable('user_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  lessonId: uuid('lesson_id').references(() => lessons.id).notNull(),
  status: text('status').notNull(),
  completionPercentage: integer('completion_percentage').default(0),
  score: integer('score'),
  completedAt: timestamp('completed_at'),
});

// Certificates table
export const certificates = pgTable('certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  courseId: uuid('course_id').references(() => courses.id).notNull(),
  issuedAt: timestamp('issued_at').defaultNow(),
  certificateUrl: text('certificate_url'),
});

// ============================================================================
// PHASE 3: VOCABULARY SYSTEM TABLES
// ============================================================================

// Dialects table (Phase 13 extended)
export const dialects = pgTable('dialects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  code: text('code').notNull().unique(),
  description: text('description'),
  region: text('region'),
  status: text('status').notNull().default('active').$type<'active' | 'deprecated' | 'experimental'>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vocabulary categories table
export const vocabularyCategories = pgTable('vocabulary_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
});

// Vocabulary tags table
export const vocabularyTags = pgTable('vocabulary_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
});

// Vocabulary tag assignments (many-to-many)
export const vocabularyTagAssignments = pgTable('vocabulary_tag_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  vocabularyId: uuid('vocabulary_id').references(() => vocabulary.id).notNull(),
  tagId: uuid('tag_id').references(() => vocabularyTags.id).notNull(),
});

// Vocabulary examples table (Phase 13 extended)
export const vocabularyExamples = pgTable('vocabulary_examples', {
  id: uuid('id').primaryKey().defaultRandom(),
  vocabularyId: uuid('vocabulary_id').references(() => vocabulary.id).notNull(),
  dialectId: uuid('dialect_id').references(() => dialects.id),
  kurdishSentence: text('kurdish_sentence').notNull(),
  persianTranslation: text('persian_translation').notNull(),
  englishTranslation: text('english_translation').notNull(),
  sourceReference: text('source_reference'),
});

// Vocabulary relations table (synonyms, antonyms, etc.)
export const vocabularyWordRelations = pgTable('vocabulary_relations', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceWordId: uuid('source_word_id').references(() => vocabulary.id).notNull(),
  targetWordId: uuid('target_word_id').references(() => vocabulary.id).notNull(),
  relationType: text('relation_type').notNull(),
});

// Vocabulary dialects (many-to-many)
export const vocabularyDialects = pgTable('vocabulary_dialects', {
  id: uuid('id').primaryKey().defaultRandom(),
  vocabularyId: uuid('vocabulary_id').references(() => vocabulary.id).notNull(),
  dialectId: uuid('dialect_id').references(() => dialects.id).notNull(),
});

// User vocabulary table (saved words, favorites, notes)
export const userVocabulary = pgTable('user_vocabulary', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  vocabularyId: uuid('vocabulary_id').references(() => vocabulary.id).notNull(),
  savedAt: timestamp('saved_at').defaultNow(),
  isFavorite: boolean('is_favorite').default(false),
  notes: text('notes'),
});

// Vocabulary notebooks table
export const vocabularyNotebooks = pgTable('vocabulary_notebooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Notebook entries table
export const notebookEntries = pgTable('notebook_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  notebookId: uuid('notebook_id').references(() => vocabularyNotebooks.id).notNull(),
  vocabularyId: uuid('vocabulary_id').references(() => vocabulary.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Vocabulary progress table (mastery tracking)
export const vocabularyProgress = pgTable('vocabulary_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  vocabularyId: uuid('vocabulary_id').references(() => vocabulary.id).notNull(),
  masteryScore: integer('mastery_score').default(0),
  reviewCount: integer('review_count').default(0),
  correctCount: integer('correct_count').default(0),
  incorrectCount: integer('incorrect_count').default(0),
  lastReviewedAt: timestamp('last_reviewed_at'),
  nextReviewAt: timestamp('next_review_at'),
});

// Review sessions table
export const reviewSessions = pgTable('review_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  totalWords: integer('total_words').default(0),
  correctAnswers: integer('correct_answers').default(0),
});

// Review attempts table
export const reviewAttempts = pgTable('review_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => reviewSessions.id).notNull(),
  vocabularyId: uuid('vocabulary_id').references(() => vocabulary.id).notNull(),
  responseQuality: integer('response_quality').notNull(),
  reviewedAt: timestamp('reviewed_at').defaultNow(),
});

// ============================================================================
// PHASE 13: DIALECT COMPARISON TABLES
// ============================================================================

// Dialect variants table - variant forms per dialect
export const dialectVariants = pgTable('dialect_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').references(() => vocabulary.id).notNull(),
  dialectId: uuid('dialect_id').references(() => dialects.id).notNull(),
  variantForm: text('variant_form').notNull(),
  phoneticForm: text('phonetic_form'),
  usageFrequency: text('usage_frequency').$type<'common' | 'uncommon' | 'rare' | 'archaic'>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Lexical meanings table - definitions and semantic domains
export const lexicalMeanings = pgTable('lexical_meanings', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').references(() => vocabulary.id).notNull(),
  definition: text('definition').notNull(),
  semanticDomain: text('semantic_domain'),
  difficultyLevel: text('difficulty_level').$type<'beginner' | 'intermediate' | 'advanced' | 'expert'>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Linguistic annotations table - morphological, phonological, syntactic, semantic notes
export const linguisticAnnotations = pgTable('linguistic_annotations', {
  id: uuid('id').primaryKey().defaultRandom(),
  entryId: uuid('entry_id').references(() => vocabulary.id).notNull(),
  annotationType: text('annotation_type').notNull().$type<'morphological' | 'phonological' | 'syntactic' | 'semantic' | 'dialect' | 'historical' | 'usage' | 'research'>(),
  annotationData: jsonb('annotation_data').$type<any>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Lexical relationships table - synonyms, antonyms, cognates across entries
export const lexicalRelationships = pgTable('lexical_relationships', {
  id: uuid('id').primaryKey().defaultRandom(),
  sourceEntryId: uuid('source_entry_id').references(() => vocabulary.id).notNull(),
  targetEntryId: uuid('target_entry_id').references(() => vocabulary.id).notNull(),
  relationshipType: text('relationship_type').notNull().$type<'synonym' | 'antonym' | 'cognate' | 'derivative' | 'compound' | 'related'>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Research collections table - user-curated lexical collections
export const researchCollections = pgTable('research_collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Dialect audit logs table - comprehensive audit trail
export const dialectAuditLogs = pgTable('dialect_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull(),
  actionType: text('action_type').notNull().$type<'create' | 'delete' | 'update' | 'publish' | 'validate' | 'import'>(),
  targetId: uuid('target_id').notNull(),
  oldValue: jsonb('old_value').$type<any>(),
  newValue: jsonb('new_value').$type<any>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// PHASE 5: SPACED REPETITION SYSTEM (SRS) TABLES
// ============================================================================

// SRS items table - All learning entities managed by SRS
export const srsItems = pgTable('srs_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  contentType: text('content_type').notNull(), // vocabulary, story_vocabulary, grammar_concepts, lesson_concepts, quiz_concepts
  contentId: uuid('content_id').notNull(),
  status: text('status').notNull(), // learning, reinforcement, retention, mastery, archived
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// SRS reviews table - Review outcomes and performance indicators
export const srsReviews = pgTable('srs_reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  srsItemId: uuid('srs_item_id').notNull().references(() => srsItems.id, { onDelete: 'cascade' }),
  reviewQuality: integer('review_quality').notNull(), // 0-5 scale (SM-2)
  responseTime: integer('response_time').notNull(), // in milliseconds
  reviewedAt: timestamp('reviewed_at').defaultNow(),
});

// SRS schedules table - Scheduling parameters and retention metrics
export const srsSchedules = pgTable('srs_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  srsItemId: uuid('srs_item_id').notNull().references(() => srsItems.id, { onDelete: 'cascade' }),
  nextReviewAt: timestamp('next_review_at').notNull(),
  currentInterval: integer('current_interval').notNull().default(0), // in days
  easeFactor: numeric('ease_factor', { precision: 10, scale: 2 }).notNull().default('2.5'), // SM-2 ease factor
  repetitionCount: integer('repetition_count').notNull().default(0),
  stabilityScore: numeric('stability_score', { precision: 10, scale: 2 }).notNull().default('0'),
  difficultyScore: numeric('difficulty_score', { precision: 10, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// SRS review queues table - Daily queue metadata
export const srsReviewQueues = pgTable('srs_review_queues', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  queueDate: date('queue_date').notNull(),
  totalItems: integer('total_items').notNull().default(0),
  generatedAt: timestamp('generated_at').defaultNow(),
});

// SRS queue items table - Prioritized review items
export const srsQueueItems = pgTable('srs_queue_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  queueId: uuid('queue_id').notNull().references(() => srsReviewQueues.id, { onDelete: 'cascade' }),
  srsItemId: uuid('srs_item_id').notNull().references(() => srsItems.id, { onDelete: 'cascade' }),
  priorityScore: numeric('priority_score', { precision: 10, scale: 2 }).notNull().default('0'),
  status: text('status').notNull(), // pending, completed, skipped
});

// SRS daily statistics table - Daily performance metrics
export const srsDailyStatistics = pgTable('srs_daily_statistics', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  reviewDate: date('review_date').notNull(),
  reviewsCompleted: integer('reviews_completed').notNull().default(0),
  accuracyPercentage: numeric('accuracy_percentage', { precision: 5, scale: 2 }).notNull().default('0'),
  retentionScore: numeric('retention_score', { precision: 5, scale: 2 }).notNull().default('0'),
  studyTime: integer('study_time').notNull().default(0), // in seconds
});

// SRS retention models table - Retention forecasts and mastery
export const srsRetentionModels = pgTable('srs_retention_models', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  predictedRetention: numeric('predicted_retention', { precision: 5, scale: 2 }).notNull().default('0'),
  masteryScore: numeric('mastery_score', { precision: 5, scale: 2 }).notNull().default('0'),
  forgettingRate: numeric('forgetting_rate', { precision: 5, scale: 2 }).notNull().default('0'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// SRS events table - Audit trail and event sourcing
export const srsEvents = pgTable('srs_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  eventType: text('event_type').notNull(), // item_created, review_submitted, queue_generated, schedule_updated, etc.
  payload: jsonb('payload').$type<any>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const courseCategoriesRelations = relations(courseCategories, ({ many }) => ({
  courses: many(courses),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  category: one(courseCategories, {
    fields: [courses.categoryId],
    references: [courseCategories.id],
  }),
  modules: many(courseModules),
  certificates: many(certificates),
}));

export const courseModulesRelations = relations(courseModules, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseModules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(courseModules, {
    fields: [lessons.moduleId],
    references: [courseModules.id],
  }),
  assets: many(lessonAssets),
  vocabulary: many(lessonVocabulary),
  grammar: many(lessonGrammar),
  quizzes: many(quizzes),
  progress: many(userProgress),
}));

export const lessonAssetsRelations = relations(lessonAssets, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonAssets.lessonId],
    references: [lessons.id],
  }),
}));

export const vocabularyRelations = relations(vocabulary, ({ many }) => ({
  lessons: many(lessonVocabulary),
  examples: many(vocabularyExamples),
  tagAssignments: many(vocabularyTagAssignments),
  dialectAssignments: many(vocabularyDialects),
  sourceRelations: many(vocabularyWordRelations, { relationName: 'sourceWord' }),
  targetRelations: many(vocabularyWordRelations, { relationName: 'targetWord' }),
}));

export const lessonVocabularyRelations = relations(lessonVocabulary, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonVocabulary.lessonId],
    references: [lessons.id],
  }),
  vocabulary: one(vocabulary, {
    fields: [lessonVocabulary.vocabularyId],
    references: [vocabulary.id],
  }),
}));

export const grammarTopicsRelations = relations(grammarTopics, ({ many }) => ({
  lessons: many(lessonGrammar),
}));

export const lessonGrammarRelations = relations(lessonGrammar, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonGrammar.lessonId],
    references: [lessons.id],
  }),
  grammarTopic: one(grammarTopics, {
    fields: [lessonGrammar.grammarTopicId],
    references: [grammarTopics.id],
  }),
}));

export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  lesson: one(lessons, {
    fields: [quizzes.lessonId],
    references: [lessons.id],
  }),
  questions: many(questions),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, {
    fields: [questions.quizId],
    references: [quizzes.id],
  }),
  options: many(questionOptions),
}));

export const questionOptionsRelations = relations(questionOptions, ({ one }) => ({
  question: one(questions, {
    fields: [questionOptions.questionId],
    references: [questions.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

// ============================================================================
// STORIES MODULE - Phase 4
// ============================================================================

// Stories table
export const stories = pgTable('stories', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  summary: text('summary'),
  content: text('content').notNull(),
  coverImageUrl: text('cover_image_url'),
  estimatedReadingTime: integer('estimated_reading_time'),
  difficultyLevel: text('difficulty_level').notNull(),
  status: text('status').notNull(),
  isFeatured: boolean('is_featured').default(false),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Story categories table
export const storyCategories = pgTable('story_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Story category assignments (many-to-many)
export const storyCategoryAssignments = pgTable('story_category_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  storyId: uuid('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => storyCategories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Story dialects (many-to-many)
export const storyDialects = pgTable('story_dialects', {
  id: uuid('id').primaryKey().defaultRandom(),
  storyId: uuid('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  dialectId: uuid('dialect_id').notNull().references(() => dialects.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Story tags table
export const storyTags = pgTable('story_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Story tag assignments (many-to-many)
export const storyTagAssignments = pgTable('story_tag_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  storyId: uuid('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  tagId: uuid('tag_id').notNull().references(() => storyTags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Story bookmarks table
export const storyBookmarks = pgTable('story_bookmarks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  storyId: uuid('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  bookmarkPosition: integer('bookmark_position').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Story favorites table
export const storyFavorites = pgTable('story_favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  storyId: uuid('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Story progress table
export const storyProgress = pgTable('story_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  storyId: uuid('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  completionPercentage: integer('completion_percentage').default(0),
  lastPosition: integer('last_position'),
  startedAt: timestamp('started_at').defaultNow(),
  lastReadAt: timestamp('last_read_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Story completions table
export const storyCompletions = pgTable('story_completions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  storyId: uuid('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  completionTime: integer('completion_time'),
  xpAwarded: integer('xp_awarded'),
  completedAt: timestamp('completed_at').defaultNow(),
});

// Story recommendations table
export const storyRecommendations = pgTable('story_recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  storyId: uuid('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  recommendationScore: numeric('recommendation_score').notNull(),
  recommendationType: text('recommendation_type').notNull(),
  generatedAt: timestamp('generated_at').defaultNow(),
});

// ============================================================================
// STORIES MODULE RELATIONS
// ============================================================================

export const dialectsRelations = relations(dialects, ({ many }) => ({
  vocabularyDialects: many(vocabularyDialects),
  stories: many(storyDialects),
}));

export const storiesRelations = relations(stories, ({ many }) => ({
  categories: many(storyCategoryAssignments),
  dialects: many(storyDialects),
  tags: many(storyTagAssignments),
  bookmarks: many(storyBookmarks),
  favorites: many(storyFavorites),
  progress: many(storyProgress),
  completions: many(storyCompletions),
  recommendations: many(storyRecommendations),
}));

export const storyCategoriesRelations = relations(storyCategories, ({ many }) => ({
  stories: many(storyCategoryAssignments),
}));

export const storyCategoryAssignmentsRelations = relations(storyCategoryAssignments, ({ one }) => ({
  story: one(stories, {
    fields: [storyCategoryAssignments.storyId],
    references: [stories.id],
  }),
  category: one(storyCategories, {
    fields: [storyCategoryAssignments.categoryId],
    references: [storyCategories.id],
  }),
}));

export const storyDialectsRelations = relations(storyDialects, ({ one }) => ({
  story: one(stories, {
    fields: [storyDialects.storyId],
    references: [stories.id],
  }),
  dialect: one(dialects, {
    fields: [storyDialects.dialectId],
    references: [dialects.id],
  }),
}));

export const storyTagsRelations = relations(storyTags, ({ many }) => ({
  stories: many(storyTagAssignments),
}));

export const storyTagAssignmentsRelations = relations(storyTagAssignments, ({ one }) => ({
  story: one(stories, {
    fields: [storyTagAssignments.storyId],
    references: [stories.id],
  }),
  tag: one(storyTags, {
    fields: [storyTagAssignments.tagId],
    references: [storyTags.id],
  }),
}));

export const storyBookmarksRelations = relations(storyBookmarks, ({ one }) => ({
  story: one(stories, {
    fields: [storyBookmarks.storyId],
    references: [stories.id],
  }),
}));

export const storyFavoritesRelations = relations(storyFavorites, ({ one }) => ({
  story: one(stories, {
    fields: [storyFavorites.storyId],
    references: [stories.id],
  }),
}));

export const storyProgressRelations = relations(storyProgress, ({ one }) => ({
  story: one(stories, {
    fields: [storyProgress.storyId],
    references: [stories.id],
  }),
}));

export const storyCompletionsRelations = relations(storyCompletions, ({ one }) => ({
  story: one(stories, {
    fields: [storyCompletions.storyId],
    references: [stories.id],
  }),
}));

export const storyRecommendationsRelations = relations(storyRecommendations, ({ one }) => ({
  story: one(stories, {
    fields: [storyRecommendations.storyId],
    references: [stories.id],
  }),
}));

// Phase 3 Vocabulary Relations
export const vocabularyCategoriesRelations = relations(vocabularyCategories, ({ many }) => ({
  // Can add category-vocabulary relations if needed
}));

export const vocabularyTagsRelations = relations(vocabularyTags, ({ many }) => ({
  tagAssignments: many(vocabularyTagAssignments),
}));

export const vocabularyTagAssignmentsRelations = relations(vocabularyTagAssignments, ({ one }) => ({
  vocabulary: one(vocabulary, {
    fields: [vocabularyTagAssignments.vocabularyId],
    references: [vocabulary.id],
  }),
  tag: one(vocabularyTags, {
    fields: [vocabularyTagAssignments.tagId],
    references: [vocabularyTags.id],
  }),
}));

export const vocabularyExamplesRelations = relations(vocabularyExamples, ({ one }) => ({
  vocabulary: one(vocabulary, {
    fields: [vocabularyExamples.vocabularyId],
    references: [vocabulary.id],
  }),
  dialect: one(dialects, {
    fields: [vocabularyExamples.dialectId],
    references: [dialects.id],
  }),
}));

export const vocabularyWordRelationsRelations = relations(vocabularyWordRelations, ({ one }) => ({
  sourceWord: one(vocabulary, {
    fields: [vocabularyWordRelations.sourceWordId],
    references: [vocabulary.id],
  }),
  targetWord: one(vocabulary, {
    fields: [vocabularyWordRelations.targetWordId],
    references: [vocabulary.id],
  }),
}));

export const vocabularyDialectsRelations = relations(vocabularyDialects, ({ one }) => ({
  vocabulary: one(vocabulary, {
    fields: [vocabularyDialects.vocabularyId],
    references: [vocabulary.id],
  }),
  dialect: one(dialects, {
    fields: [vocabularyDialects.dialectId],
    references: [dialects.id],
  }),
}));

export const userVocabularyRelations = relations(userVocabulary, ({ one }) => ({
  vocabulary: one(vocabulary, {
    fields: [userVocabulary.vocabularyId],
    references: [vocabulary.id],
  }),
}));

export const vocabularyNotebooksRelations = relations(vocabularyNotebooks, ({ many }) => ({
  entries: many(notebookEntries),
}));

export const notebookEntriesRelations = relations(notebookEntries, ({ one }) => ({
  notebook: one(vocabularyNotebooks, {
    fields: [notebookEntries.notebookId],
    references: [vocabularyNotebooks.id],
  }),
  vocabulary: one(vocabulary, {
    fields: [notebookEntries.vocabularyId],
    references: [vocabulary.id],
  }),
}));

export const vocabularyProgressRelations = relations(vocabularyProgress, ({ one }) => ({
  vocabulary: one(vocabulary, {
    fields: [vocabularyProgress.vocabularyId],
    references: [vocabulary.id],
  }),
}));

export const reviewSessionsRelations = relations(reviewSessions, ({ many }) => ({
  attempts: many(reviewAttempts),
}));

export const reviewAttemptsRelations = relations(reviewAttempts, ({ one }) => ({
  session: one(reviewSessions, {
    fields: [reviewAttempts.sessionId],
    references: [reviewSessions.id],
  }),
  vocabulary: one(vocabulary, {
    fields: [reviewAttempts.vocabularyId],
    references: [vocabulary.id],
  }),
}));

// ============================================================================
// PHASE 5: SRS TABLE RELATIONS
// ============================================================================

export const srsItemsRelations = relations(srsItems, ({ one, many }) => ({
  reviews: many(srsReviews),
  schedule: one(srsSchedules),
  queueItems: many(srsQueueItems),
}));

export const srsReviewsRelations = relations(srsReviews, ({ one }) => ({
  srsItem: one(srsItems, {
    fields: [srsReviews.srsItemId],
    references: [srsItems.id],
  }),
}));

export const srsSchedulesRelations = relations(srsSchedules, ({ one }) => ({
  srsItem: one(srsItems, {
    fields: [srsSchedules.srsItemId],
    references: [srsItems.id],
  }),
}));

export const srsReviewQueuesRelations = relations(srsReviewQueues, ({ many }) => ({
  queueItems: many(srsQueueItems),
}));

export const srsQueueItemsRelations = relations(srsQueueItems, ({ one }) => ({
  queue: one(srsReviewQueues, {
    fields: [srsQueueItems.queueId],
    references: [srsReviewQueues.id],
  }),
  srsItem: one(srsItems, {
    fields: [srsQueueItems.srsItemId],
    references: [srsItems.id],
  }),
}));

// ============================================================================
// PHASE 7: STREAKS & ACHIEVEMENTS TABLES
// ============================================================================

// User streaks table
export const userStreaks = pgTable('user_streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActivityDate: date('last_activity_date'),
  streakStatus: text('streak_status').notNull().default('active'), // active, broken, frozen
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Streak history table
export const streakHistory = pgTable('streak_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  activityDate: date('activity_date').notNull(),
  streakValue: integer('streak_value').notNull(),
  activityType: text('activity_type').notNull(), // lesson, quiz, vocabulary, story, practice
  createdAt: timestamp('created_at').defaultNow(),
});

// Streak recovery requests table
export const streakRecoveryRequests = pgTable('streak_recovery_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  missedDate: date('missed_date').notNull(),
  recoveryType: text('recovery_type').notNull(), // automatic, manual, reward_based, administrative, promotional
  status: text('status').notNull().default('pending'), // pending, approved, denied, completed
  reason: text('reason'),
  reviewedBy: uuid('reviewed_by'),
  createdAt: timestamp('created_at').defaultNow(),
  reviewedAt: timestamp('reviewed_at'),
});

// Achievements table (achievement definitions)
export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  icon: text('icon'),
  criteria: jsonb('criteria').$type<any>().notNull(),
  xpBonus: integer('xp_bonus').default(0),
  badgeReward: text('badge_reward'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User achievements table (user progress on achievements)
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  achievementId: uuid('achievement_id').references(() => achievements.id).notNull(),
  progressValue: integer('progress_value').default(0),
  status: text('status').notNull().default('in_progress'), // in_progress, completed, claimed
  earnedAt: timestamp('earned_at'),
  claimedAt: timestamp('claimed_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Achievement audit logs table (Phase 7 extension to Phase 6 achievements)
export const achievementAuditLogs = pgTable('achievement_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull(),
  targetUserId: uuid('target_user_id').notNull(),
  actionType: text('action_type').notNull(), // earned, claimed, revoked, manually_awarded, criteria_updated
  oldValue: jsonb('old_value').$type<any>(),
  newValue: jsonb('new_value').$type<any>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// PHASE 7: STREAKS & ACHIEVEMENTS RELATIONS
// ============================================================================

export const userStreaksRelations = relations(userStreaks, ({ many }) => ({
  history: many(streakHistory),
  recoveryRequests: many(streakRecoveryRequests),
}));

// ============================================================================
// PHASE 13: DIALECT COMPARISON RELATIONS
// ============================================================================

export const dialectVariantsRelations = relations(dialectVariants, ({ one }) => ({
  entry: one(vocabulary, {
    fields: [dialectVariants.entryId],
    references: [vocabulary.id],
  }),
  dialect: one(dialects, {
    fields: [dialectVariants.dialectId],
    references: [dialects.id],
  }),
}));

export const lexicalMeaningsRelations = relations(lexicalMeanings, ({ one }) => ({
  entry: one(vocabulary, {
    fields: [lexicalMeanings.entryId],
    references: [vocabulary.id],
  }),
}));

export const linguisticAnnotationsRelations = relations(linguisticAnnotations, ({ one }) => ({
  entry: one(vocabulary, {
    fields: [linguisticAnnotations.entryId],
    references: [vocabulary.id],
  }),
}));

export const lexicalRelationshipsRelations = relations(lexicalRelationships, ({ one }) => ({
  sourceEntry: one(vocabulary, {
    fields: [lexicalRelationships.sourceEntryId],
    references: [vocabulary.id],
  }),
  targetEntry: one(vocabulary, {
    fields: [lexicalRelationships.targetEntryId],
    references: [vocabulary.id],
  }),
}));

export const researchCollectionsRelations = relations(researchCollections, ({ many }) => ({
  // Can add collection entries relation if needed
}));

export const dialectAuditLogsRelations = relations(dialectAuditLogs, ({ one }) => ({
  // Can add actor relation if users table exists
}));

// ============================================================================
// PHASE 8: DAILY CHALLENGES TABLES
// ============================================================================

// Challenge Definitions table - Stores reusable challenge templates and configurations
export const challengeDefinitions = pgTable('challenge_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  challengeType: text('challenge_type').notNull(), // quiz, vocabulary, translation, listening, reading, writing, grammar, timed, streak, xp, teacher_created, event, seasonal
  difficultyLevel: text('difficulty_level').notNull(), // beginner, intermediate, advanced, expert
  contentConfig: jsonb('content_config').$type<any>(), // Challenge-specific configuration
  scoringRules: jsonb('scoring_rules').$type<any>(), // Scoring algorithm configuration
  timeLimit: integer('time_limit'), // Time limit in seconds (null = unlimited)
  maxAttempts: integer('max_attempts'), // Maximum attempts per user (null = unlimited)
  xpReward: integer('xp_reward').notNull().default(0),
  badgeReward: uuid('badge_reward'), // Reference to achievement system
  isPublic: boolean('is_public').default(true),
  createdBy: uuid('created_by').notNull(),
  status: text('status').notNull().default('draft'), // draft, active, archived
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Challenge Schedules table - Manages challenge publication and lifecycle
export const challengeSchedules = pgTable('challenge_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  challengeDefinitionId: uuid('challenge_definition_id').notNull().references(() => challengeDefinitions.id),
  title: text('title').notNull(),
  description: text('description'),
  scheduledDate: date('scheduled_date').notNull(),
  scheduledTime: timestamp('scheduled_time').notNull(),
  endDate: timestamp('end_date'),
  timezone: text('timezone').notNull().default('UTC'),
  status: text('status').notNull().default('draft'), // draft, scheduled, published, active, completed, archived
  publicationStatus: text('publication_status').notNull().default('pending'), // pending, approved, rejected
  approvedBy: uuid('approved_by'),
  approvedAt: timestamp('approved_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Challenge Submissions table - Stores user challenge submissions
export const challengeSubmissions = pgTable('challenge_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  scheduleId: uuid('schedule_id').notNull().references(() => challengeSchedules.id),
  userId: uuid('user_id').notNull(),
  submissionData: jsonb('submission_data').$type<any>().notNull(),
  submittedAt: timestamp('submitted_at').defaultNow(),
  timeTaken: integer('time_taken'), // Time taken in seconds
  status: text('status').notNull().default('pending'), // pending, processing, approved, rejected, flagged
  reviewStatus: text('review_status').notNull().default('automatic'), // automatic, teacher_review, admin_review, hybrid
  reviewedBy: uuid('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  reviewNotes: text('review_notes'),
  fraudScore: integer('fraud_score').default(0), // 0-100, higher = more suspicious
  isDuplicate: boolean('is_duplicate').default(false),
  duplicateOf: uuid('duplicate_of'), // Reference to original submission
});

// Challenge Scores table - Stores calculated scores for submissions
export const challengeScores = pgTable('challenge_scores', {
  id: uuid('id').primaryKey().defaultRandom(),
  submissionId: uuid('submission_id').notNull().references(() => challengeSubmissions.id),
  userId: uuid('user_id').notNull(),
  scheduleId: uuid('schedule_id').notNull().references(() => challengeSchedules.id),
  baseScore: integer('base_score').notNull(), // Raw score from submission
  timeBonus: integer('time_bonus').default(0),
  difficultyMultiplier: numeric('difficulty_multiplier', { precision: 3, scale: 2 }).notNull().default('1.0'),
  streakBonus: integer('streak_bonus').default(0),
  achievementBonus: integer('achievement_bonus').default(0),
  finalScore: integer('final_score').notNull(),
  rank: integer('rank'), // Leaderboard rank
  percentile: numeric('percentile', { precision: 5, scale: 2 }), // Percentile rank
  calculatedAt: timestamp('calculated_at').defaultNow(),
});

// Challenge Rewards table - Tracks reward distribution
export const challengeRewards = pgTable('challenge_rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  scoreId: uuid('score_id').notNull().references(() => challengeScores.id),
  userId: uuid('user_id').notNull(),
  rewardType: text('reward_type').notNull(), // xp, badge, achievement, certificate, title, decoration, content, course_access
  rewardValue: jsonb('reward_value').$type<any>().notNull(),
  awardedAt: timestamp('awarded_at').defaultNow(),
  isClaimed: boolean('is_claimed').default(false),
  claimedAt: timestamp('claimed_at'),
});

// Challenge Leaderboards table - Stores leaderboard entries
export const challengeLeaderboards = pgTable('challenge_leaderboards', {
  id: uuid('id').primaryKey().defaultRandom(),
  scheduleId: uuid('schedule_id').notNull().references(() => challengeSchedules.id),
  userId: uuid('user_id').notNull(),
  leaderboardType: text('leaderboard_type').notNull(), // daily, weekly, monthly, challenge, course, global, classroom, seasonal
  scope: text('scope').notNull(), // global, classroom, course
  scopeId: uuid('scope_id'), // Reference to classroom/course if applicable
  score: integer('score').notNull(),
  rank: integer('rank').notNull(),
  previousRank: integer('previous_rank'),
  change: integer('change'), // Rank change (+/-)
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Challenge Audit Logs table - Audit trail for all challenge operations
export const challengeAuditLogs = pgTable('challenge_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(), // definition, schedule, submission, score, reward, leaderboard
  entityId: uuid('entity_id').notNull(),
  action: text('action').notNull(), // created, updated, deleted, published, archived, submitted, approved, rejected
  userId: uuid('user_id').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  changes: jsonb('changes').$type<any>(), // Before/after state
  metadata: jsonb('metadata').$type<any>(), // Additional context
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// PHASE 8: DAILY CHALLENGES RELATIONS
// ============================================================================

export const challengeDefinitionsRelations = relations(challengeDefinitions, ({ one, many }) => ({
  schedules: many(challengeSchedules),
}));

export const challengeSchedulesRelations = relations(challengeSchedules, ({ one, many }) => ({
  definition: one(challengeDefinitions, {
    fields: [challengeSchedules.challengeDefinitionId],
    references: [challengeDefinitions.id],
  }),
  submissions: many(challengeSubmissions),
  scores: many(challengeScores),
  leaderboards: many(challengeLeaderboards),
}));

export const challengeSubmissionsRelations = relations(challengeSubmissions, ({ one }) => ({
  schedule: one(challengeSchedules, {
    fields: [challengeSubmissions.scheduleId],
    references: [challengeSchedules.id],
  }),
  score: one(challengeScores),
}));

export const challengeScoresRelations = relations(challengeScores, ({ one, many }) => ({
  submission: one(challengeSubmissions, {
    fields: [challengeScores.submissionId],
    references: [challengeSubmissions.id],
  }),
  schedule: one(challengeSchedules, {
    fields: [challengeScores.scheduleId],
    references: [challengeSchedules.id],
  }),
  rewards: many(challengeRewards),
}));

export const challengeRewardsRelations = relations(challengeRewards, ({ one }) => ({
  score: one(challengeScores, {
    fields: [challengeRewards.scoreId],
    references: [challengeScores.id],
  }),
}));

export const challengeLeaderboardsRelations = relations(challengeLeaderboards, ({ one }) => ({
  schedule: one(challengeSchedules, {
    fields: [challengeLeaderboards.scheduleId],
    references: [challengeSchedules.id],
  }),
}));

export const streakHistoryRelations = relations(streakHistory, ({ one }) => ({
  userStreak: one(userStreaks, {
    fields: [streakHistory.userId],
    references: [userStreaks.userId],
  }),
}));

export const streakRecoveryRequestsRelations = relations(streakRecoveryRequests, ({ one }) => ({
  userStreak: one(userStreaks, {
    fields: [streakRecoveryRequests.userId],
    references: [userStreaks.userId],
  }),
}));

// ============================================================================
// PHASE 6: XP AND LEVELING SYSTEM TABLES
// ============================================================================

// XP transactions table - Stores all XP-related transactions
export const xpTransactions = pgTable('xp_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  xpAmount: integer('xp_amount').notNull(),
  transactionType: text('transaction_type').notNull().$type<'earned' | 'removed' | 'corrected'>(),
  sourceType: text('source_type').notNull().$type<'lesson_completion' | 'quiz_completion' | 'course_completion' | 'daily_login' | 'streak' | 'achievement' | 'teacher_award' | 'admin_bonus' | 'special_event' | 'placement_test_completion' | 'community_post' | 'community_comment' | 'helpful_content'>(),
  sourceId: uuid('source_id'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User levels table - Maintains current progression state for each user
export const userLevels = pgTable('user_levels', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  currentLevel: integer('current_level').notNull().default(1),
  currentXP: integer('current_xp').notNull().default(0),
  totalXP: integer('total_xp').notNull().default(0),
  xpToNextLevel: integer('xp_to_next_level').notNull().default(100),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Level definitions table - Defines configurable level thresholds
export const levelDefinitions = pgTable('level_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  levelNumber: integer('level_number').notNull().unique(),
  requiredXP: integer('required_xp').notNull(),
  title: text('title').notNull(),
  badgeId: uuid('badge_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Rewards table - Stores all reward definitions
export const rewards = pgTable('rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  rewardType: text('reward_type').notNull().$type<'badge' | 'certificate' | 'avatar_item' | 'profile_decoration' | 'course_unlock' | 'special_content' | 'event_access'>(),
  requiredLevel: integer('required_level').notNull().default(1),
  requiredXP: integer('required_xp').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User rewards table - Tracks rewards earned and claimed by users
export const userRewards = pgTable('user_rewards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  rewardId: uuid('reward_id').notNull().references(() => rewards.id),
  earnedAt: timestamp('earned_at').defaultNow().notNull(),
  claimedAt: timestamp('claimed_at'),
  status: text('status').notNull().default('available').$type<'available' | 'claimed' | 'expired'>(),
});

// XP audit logs table - Immutable audit records for XP actions
export const xpAuditLogs = pgTable('xp_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull(),
  targetUserId: uuid('target_user_id').notNull(),
  actionType: text('action_type').notNull().$type<'xp_granted' | 'xp_removed' | 'xp_corrected' | 'reward_issued' | 'reward_claimed' | 'level_up' | 'policy_modified'>(),
  oldValue: jsonb('old_value').$type<any>(),
  newValue: jsonb('new_value').$type<any>(),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ============================================================================
// PHASE 6: XP AND LEVELING SYSTEM RELATIONS
// ============================================================================

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
  user: one(userLevels, {
    fields: [xpTransactions.userId],
    references: [userLevels.userId],
  }),
}));

export const userLevelsRelations = relations(userLevels, ({ one, many }) => ({
  transactions: many(xpTransactions),
  rewards: many(userRewards),
}));

export const rewardsRelations = relations(rewards, ({ many }) => ({
  userRewards: many(userRewards),
}));

export const userRewardsRelations = relations(userRewards, ({ one }) => ({
  user: one(userLevels, {
    fields: [userRewards.userId],
    references: [userLevels.userId],
  }),
  reward: one(rewards, {
    fields: [userRewards.rewardId],
    references: [rewards.id],
  }),
}));

// ============================================================================
// PHASE 9.1: COIN SYSTEM - WALLET MANAGEMENT TABLES
// ============================================================================

// User wallets table - Manages user coin wallets
export const userWallets = pgTable('user_wallets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  currentBalance: integer('current_balance').notNull().default(0),
  lifetimeEarned: integer('lifetime_earned').notNull().default(0),
  lifetimeSpent: integer('lifetime_spent').notNull().default(0),
  walletStatus: text('wallet_status').notNull().default('active'), // active, suspended, frozen
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Wallet transactions table - Immutable transaction log
export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  walletId: uuid('wallet_id').notNull().references(() => userWallets.id),
  userId: uuid('user_id').notNull(),
  transactionType: text('transaction_type').notNull(), // credit, debit, adjustment, correction, refund, admin_grant, reward_distribution
  amount: integer('amount').notNull(),
  balanceBefore: integer('balance_before').notNull(),
  balanceAfter: integer('balance_after').notNull(),
  referenceType: text('reference_type'), // lesson_completion, quiz_completion, daily_login, streak_milestone, mission_completion, admin_adjustment
  referenceId: uuid('reference_id'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Wallet audit logs table - Audit trail for all wallet operations
export const walletAuditLogs = pgTable('wallet_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull(),
  targetUserId: uuid('target_user_id').notNull(),
  actionType: text('action_type').notNull(), // wallet_created, balance_updated, transaction_recorded, status_changed, policy_modified
  oldValue: jsonb('old_value').$type<any>(),
  newValue: jsonb('new_value').$type<any>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Coin economy policies table - Configurable coin economy rules
export const coinEconomyPolicies = pgTable('coin_economy_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: text('event_type').notNull(), // daily_login, lesson_completion, quiz_completion, vocabulary_session, streak_milestone, mission_completion
  coinReward: integer('coin_reward').notNull(),
  xpReward: integer('xp_reward').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// ============================================================================
// PHASE 9.1: COIN SYSTEM - WALLET MANAGEMENT RELATIONS
// ============================================================================

export const userWalletsRelations = relations(userWallets, ({ many }) => ({
  transactions: many(walletTransactions),
}));

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(userWallets, {
    fields: [walletTransactions.walletId],
    references: [userWallets.id],
  }),
}));

// ============================================================================
// PHASE 9.2: MISSION SYSTEM TABLES
// ============================================================================

// Mission definitions table - Mission templates
export const missionDefinitions = pgTable('mission_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  missionType: text('mission_type').notNull(), // daily_login, lesson_completion, quiz_completion, vocabulary, streak
  difficulty: text('difficulty').notNull(), // easy, medium, hard
  criteria: jsonb('criteria').$type<any>(), // Mission-specific criteria (e.g., target_count, time_limit)
  xpReward: integer('xp_reward').notNull(),
  coinReward: integer('coin_reward').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Mission schedules table - Mission publication scheduling
export const missionSchedules = pgTable('mission_schedules', {
  id: uuid('id').primaryKey().defaultRandom(),
  missionId: uuid('mission_id').notNull().references(() => missionDefinitions.id),
  startAt: timestamp('start_at'),
  endAt: timestamp('end_at'),
  resetPolicy: text('reset_policy').notNull(), // daily, weekly, custom
  status: text('status').notNull(), // draft, scheduled, published, active, completed, archived
  createdAt: timestamp('created_at').defaultNow(),
});

// User missions table - User mission progress
export const userMissions = pgTable('user_missions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  missionId: uuid('mission_id').notNull().references(() => missionDefinitions.id),
  progressValue: integer('progress_value').default(0),
  completionStatus: text('completion_status').notNull(), // not_started, in_progress, completed, expired
  xpAwarded: integer('xp_awarded').default(0),
  coinAwarded: integer('coin_awarded').default(0),
  completedAt: timestamp('completed_at'),
});

// Mission history table - Mission completion history
export const missionHistory = pgTable('mission_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  missionId: uuid('mission_id').notNull().references(() => missionDefinitions.id),
  completionResult: text('completion_result').notNull(), // success, failed, expired
  rewardSnapshot: jsonb('reward_snapshot').$type<any>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// PHASE 9.2: MISSION SYSTEM RELATIONS
// ============================================================================

export const missionDefinitionsRelations = relations(missionDefinitions, ({ one, many }) => ({
  schedules: many(missionSchedules),
  userMissions: many(userMissions),
  history: many(missionHistory),
}));

export const missionSchedulesRelations = relations(missionSchedules, ({ one, many }) => ({
  definition: one(missionDefinitions, {
    fields: [missionSchedules.missionId],
    references: [missionDefinitions.id],
  }),
  userMissions: many(userMissions),
}));

export const userMissionsRelations = relations(userMissions, ({ one }) => ({
  mission: one(missionDefinitions, {
    fields: [userMissions.missionId],
    references: [missionDefinitions.id],
  }),
}));

export const missionHistoryRelations = relations(missionHistory, ({ one }) => ({
  mission: one(missionDefinitions, {
    fields: [missionHistory.missionId],
    references: [missionDefinitions.id],
  }),
}));

// ============================================================================
// PHASE 12: COMMUNITY PLATFORM TABLES
// ============================================================================

// Community profiles table
export const communityProfiles = pgTable('community_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  displayName: text('display_name').notNull(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  reputationScore: integer('reputation_score').default(0),
  postCount: integer('post_count').default(0),
  commentCount: integer('comment_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Community posts table
export const communityPosts = pgTable('community_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  postType: text('post_type').notNull().default('discussion'), // discussion, question, tip, experience, success, course_discussion, announcement, update
  status: text('status').notNull().default('draft'), // draft, published, reported, under_review, approved, removed, archived
  visibility: text('visibility').notNull().default('public'), // public, private, restricted
  reactionCount: integer('reaction_count').default(0),
  commentCount: integer('comment_count').default(0),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Community comments table
// @ts-ignore circular reference
export const communityComments = pgTable('community_comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id').notNull().references(() => communityPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  // @ts-ignore
  parentCommentId: uuid('parent_comment_id').references(() => communityComments.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  status: text('status').notNull().default('published'), // published, reported, removed
  reactionCount: integer('reaction_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Community reactions table
export const communityReactions = pgTable('community_reactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  targetType: text('target_type').notNull(), // post, comment
  targetId: uuid('target_id').notNull(),
  reactionType: text('reaction_type').notNull(), // like, helpful, insightful, celebrate, support
  createdAt: timestamp('created_at').defaultNow(),
});

// Community reports table
export const communityReports = pgTable('community_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reporterId: uuid('reporter_id').notNull(),
  targetType: text('target_type').notNull(), // post, comment, user
  targetId: uuid('target_id').notNull(),
  reportReason: text('report_reason').notNull(), // spam, harassment, hate_speech, misinformation, inappropriate, copyright, self_harm, other
  reportDetails: text('report_details'),
  status: text('status').notNull().default('pending'), // pending, under_review, resolved, dismissed
  reviewedBy: uuid('reviewed_by'),
  reviewedAt: timestamp('reviewed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Moderation actions table
export const moderationActions = pgTable('moderation_actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  moderatorId: uuid('moderator_id').notNull(),
  targetType: text('target_type').notNull(), // post, comment, user
  targetId: uuid('target_id').notNull(),
  actionType: text('action_type').notNull(), // approve, remove, restore, warn, restrict_temp, restrict_perm, escalate, review_account
  reason: text('reason').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Community notifications table
export const communityNotifications = pgTable('community_notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  notificationType: text('notification_type').notNull(), // post_reaction, comment_reply, mention, moderation_action, report_update, achievement_unlock, announcement
  payload: jsonb('payload').$type<any>(),
  readStatus: boolean('read_status').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Community audit logs table
export const communityAuditLogs = pgTable('community_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull(),
  actionType: text('action_type').notNull(),
  targetId: uuid('target_id').notNull(),
  oldValue: jsonb('old_value').$type<any>(),
  newValue: jsonb('new_value').$type<any>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// PHASE 12: COMMUNITY PLATFORM RELATIONS
// ============================================================================

export const communityProfilesRelations = relations(communityProfiles, ({ one, many }) => ({
  user: one(userLevels, {
    fields: [communityProfiles.userId],
    references: [userLevels.userId],
  }),
  posts: many(communityPosts),
  comments: many(communityComments),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  author: one(communityProfiles, {
    fields: [communityPosts.userId],
    references: [communityProfiles.userId],
  }),
  comments: many(communityComments),
  reactions: many(communityReactions),
  reports: many(communityReports),
}));

export const communityCommentsRelations = relations(communityComments, ({ one, many }) => ({
  post: one(communityPosts, {
    fields: [communityComments.postId],
    references: [communityPosts.id],
  }),
  author: one(communityProfiles, {
    fields: [communityComments.userId],
    references: [communityProfiles.userId],
  }),
  parent: one(communityComments, {
    fields: [communityComments.parentCommentId],
    references: [communityComments.id],
  }),
  replies: many(communityComments, { relationName: 'replies' }),
  reactions: many(communityReactions),
}));

export const communityReactionsRelations = relations(communityReactions, ({ one }) => ({
  user: one(communityProfiles, {
    fields: [communityReactions.userId],
    references: [communityProfiles.userId],
  }),
}));

export const communityReportsRelations = relations(communityReports, ({ one }) => ({
  reporter: one(communityProfiles, {
    fields: [communityReports.reporterId],
    references: [communityProfiles.userId],
  }),
}));

export const moderationActionsRelations = relations(moderationActions, ({ one }) => ({
  moderator: one(communityProfiles, {
    fields: [moderationActions.moderatorId],
    references: [communityProfiles.userId],
  }),
}));

export const communityNotificationsRelations = relations(communityNotifications, ({ one }) => ({
  user: one(communityProfiles, {
    fields: [communityNotifications.userId],
    references: [communityProfiles.userId],
  }),
}));

// ============================================================================
// PHASE 11: LEARNING PATHS TABLES
// ============================================================================

// Learning programs table - Top-level program definitions
export const learningPrograms = pgTable('learning_programs', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  programType: text('program_type').notNull(), // 'beginner', 'intermediate', 'advanced', 'specialized'
  difficultyLevel: text('difficulty_level'), // 'beginner', 'intermediate', 'advanced'
  status: text('status').notNull().default('draft'), // 'draft', 'active', 'archived'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Learning paths table - Specific learning paths within programs
export const learningPaths = pgTable('learning_paths', {
  id: uuid('id').primaryKey().defaultRandom(),
  programId: uuid('program_id').notNull().references(() => learningPrograms.id),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  estimatedDuration: integer('estimated_duration'), // in minutes
  difficultyLevel: text('difficulty_level'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Learning modules table - Modules within learning paths
export const learningModules = pgTable('learning_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  pathId: uuid('path_id').notNull().references(() => learningPaths.id),
  title: text('title').notNull(),
  description: text('description'),
  sequenceOrder: integer('sequence_order').default(0),
  estimatedDuration: integer('estimated_duration'), // in minutes
  createdAt: timestamp('created_at').defaultNow(),
});

// Learning units table - Units within modules
export const learningUnits = pgTable('learning_units', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').notNull().references(() => learningModules.id),
  title: text('title').notNull(),
  description: text('description'),
  sequenceOrder: integer('sequence_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Learning lessons table - Lessons within units
export const learningLessons = pgTable('learning_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  unitId: uuid('unit_id').notNull().references(() => learningUnits.id),
  title: text('title').notNull(),
  lessonType: text('lesson_type').notNull(), // 'video', 'text', 'interactive', 'assessment', 'practice'
  contentReference: text('content_reference'), // reference to existing lessons table
  estimatedDuration: integer('estimated_duration'), // in minutes
  sequenceOrder: integer('sequence_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Learning activities table - Activities within lessons
export const learningActivities = pgTable('learning_activities', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => learningLessons.id),
  activityType: text('activity_type').notNull(), // 'quiz', 'exercise', 'practice', 'reading', 'listening'
  content: jsonb('content').$type<any>(),
  sequenceOrder: integer('sequence_order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Learning assessments table - Assessments within lessons
export const learningAssessments = pgTable('learning_assessments', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id').notNull().references(() => learningLessons.id),
  assessmentType: text('assessment_type').notNull(), // 'quiz', 'test', 'placement', 'final'
  passingScore: integer('passing_score'), // percentage
  content: jsonb('content').$type<any>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// User learning progress table - Tracks user progress through learning paths
export const userLearningProgress = pgTable('user_learning_progress', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  pathId: uuid('path_id').notNull().references(() => learningPaths.id),
  moduleId: uuid('module_id').references(() => learningModules.id),
  lessonId: uuid('lesson_id').references(() => learningLessons.id),
  progressPercentage: integer('progress_percentage').default(0),
  completionStatus: text('completion_status').notNull().default('not_started'), // 'not_started', 'in_progress', 'completed'
  completedAt: timestamp('completed_at'),
  timeSpent: integer('time_spent'), // in seconds
  lastAccessedAt: timestamp('last_accessed_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Learning certificates table - Certificates issued to users
export const learningCertificates = pgTable('learning_certificates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  pathId: uuid('path_id').notNull().references(() => learningPaths.id),
  certificateNumber: text('certificate_number').unique(),
  issuedAt: timestamp('issued_at').defaultNow(),
  status: text('status').notNull().default('issued'), // 'issued', 'revoked'
  certificateUrl: text('certificate_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Learning recommendations table - Personalized recommendations for users
export const learningRecommendations = pgTable('learning_recommendations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  recommendationType: text('recommendation_type').notNull(), // 'next_lesson', 'next_module', 'remedial', 'practice', 'certification'
  recommendationData: jsonb('recommendation_data').$type<any>(),
  confidenceScore: numeric('confidence_score', { precision: 5, scale: 2 }),
  generatedAt: timestamp('generated_at').defaultNow(),
  expiresAt: timestamp('expires_at'),
  isDismissed: boolean('is_dismissed').default(false),
});

// Learning audit logs table - Audit trail for learning paths operations
export const learningAuditLogs = pgTable('learning_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull(),
  actionType: text('action_type').notNull(), // 'created', 'updated', 'deleted', 'enrolled', 'completed', 'certified'
  targetType: text('target_type').notNull(), // 'program', 'path', 'module', 'lesson', 'progress', 'certificate'
  targetId: uuid('target_id').notNull(),
  oldValue: jsonb('old_value').$type<any>(),
  newValue: jsonb('new_value').$type<any>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// PHASE 11: LEARNING PATHS RELATIONS
// ============================================================================

export const learningProgramsRelations = relations(learningPrograms, ({ many }) => ({
  paths: many(learningPaths),
}));

export const learningPathsRelations = relations(learningPaths, ({ one, many }) => ({
  program: one(learningPrograms, {
    fields: [learningPaths.programId],
    references: [learningPrograms.id],
  }),
  modules: many(learningModules),
  progress: many(userLearningProgress),
  certificates: many(learningCertificates),
}));

export const learningModulesRelations = relations(learningModules, ({ one, many }) => ({
  path: one(learningPaths, {
    fields: [learningModules.pathId],
    references: [learningPaths.id],
  }),
  units: many(learningUnits),
  progress: many(userLearningProgress),
}));

export const learningUnitsRelations = relations(learningUnits, ({ one, many }) => ({
  module: one(learningModules, {
    fields: [learningUnits.moduleId],
    references: [learningModules.id],
  }),
  lessons: many(learningLessons),
}));

export const learningLessonsRelations = relations(learningLessons, ({ one, many }) => ({
  unit: one(learningUnits, {
    fields: [learningLessons.unitId],
    references: [learningUnits.id],
  }),
  activities: many(learningActivities),
  assessments: many(learningAssessments),
  progress: many(userLearningProgress),
}));

export const learningActivitiesRelations = relations(learningActivities, ({ one }) => ({
  lesson: one(learningLessons, {
    fields: [learningActivities.lessonId],
    references: [learningLessons.id],
  }),
}));

export const learningAssessmentsRelations = relations(learningAssessments, ({ one }) => ({
  lesson: one(learningLessons, {
    fields: [learningAssessments.lessonId],
    references: [learningLessons.id],
  }),
}));

export const userLearningProgressRelations = relations(userLearningProgress, ({ one }) => ({
  path: one(learningPaths, {
    fields: [userLearningProgress.pathId],
    references: [learningPaths.id],
  }),
  module: one(learningModules, {
    fields: [userLearningProgress.moduleId],
    references: [learningModules.id],
  }),
  lesson: one(learningLessons, {
    fields: [userLearningProgress.lessonId],
    references: [learningLessons.id],
  }),
}));

export const learningCertificatesRelations = relations(learningCertificates, ({ one }) => ({
  path: one(learningPaths, {
    fields: [learningCertificates.pathId],
    references: [learningPaths.id],
  }),
}));

// ============================================================================
// PHASE 10: PLACEMENT TEST TABLES
// ============================================================================

// Assessment questions table - Question bank with versioning
export const assessmentQuestions = pgTable('assessment_questions', {
  id: uuid('id').primaryKey().defaultRandom(),
  questionType: text('question_type').notNull(), // 'multiple_choice', 'true_false', 'fill_blank', 'audio_listening', 'speaking'
  skillDomain: text('skill_domain').notNull(), // 'reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary'
  difficultyLevel: text('difficulty_level').notNull(), // 'beginner', 'intermediate', 'advanced'
  content: jsonb('content').$type<any>().notNull(), // Question content (text, audio URL, options, etc.)
  correctAnswer: jsonb('correct_answer').$type<any>().notNull(), // Correct answer(s)
  metadata: jsonb('metadata').$type<any>(), // Additional metadata (points, time limit, etc.)
  status: text('status').notNull().default('active'), // 'active', 'archived', 'draft'
  version: integer('version').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Assessment tests table - Test definitions
export const assessmentTests = pgTable('assessment_tests', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  assessmentType: text('assessment_type').notNull(), // 'placement', 'diagnostic', 'proficiency'
  status: text('status').notNull().default('active'), // 'active', 'archived', 'draft'
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Assessment sections table - Test sections by skill domain
export const assessmentSections = pgTable('assessment_sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  testId: uuid('test_id').notNull().references(() => assessmentTests.id),
  skillDomain: text('skill_domain').notNull(), // 'reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary'
  weight: numeric('weight', { precision: 5, scale: 2 }).notNull().default('1.0'), // Section weight in overall score
  timeLimit: integer('time_limit'), // Time limit in seconds (null = unlimited)
  questionCount: integer('question_count').notNull(),
});

// Assessment attempts table - User test attempts
export const assessmentAttempts = pgTable('assessment_attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  testId: uuid('test_id').notNull().references(() => assessmentTests.id),
  startedAt: timestamp('started_at').defaultNow(),
  completedAt: timestamp('completed_at'),
  status: text('status').notNull().default('in_progress'), // 'in_progress', 'completed', 'abandoned', 'expired'
  overallScore: numeric('overall_score', { precision: 5, scale: 2 }),
  placementLevel: text('placement_level'), // 'beginner', 'intermediate', 'advanced'
});

// Assessment responses table - Individual question responses
export const assessmentResponses = pgTable('assessment_responses', {
  id: uuid('id').primaryKey().defaultRandom(),
  attemptId: uuid('attempt_id').notNull().references(() => assessmentAttempts.id),
  questionId: uuid('question_id').notNull().references(() => assessmentQuestions.id),
  responseData: jsonb('response_data').$type<any>().notNull(), // User's response
  score: numeric('score', { precision: 5, scale: 2 }),
  evaluatedAt: timestamp('evaluated_at'),
});

// Placement results table - Final placement outcomes
export const placementResults = pgTable('placement_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  attemptId: uuid('attempt_id').notNull().references(() => assessmentAttempts.id),
  readingScore: numeric('reading_score', { precision: 5, scale: 2 }),
  writingScore: numeric('writing_score', { precision: 5, scale: 2 }),
  listeningScore: numeric('listening_score', { precision: 5, scale: 2 }),
  speakingScore: numeric('speaking_score', { precision: 5, scale: 2 }),
  grammarScore: numeric('grammar_score', { precision: 5, scale: 2 }),
  vocabularyScore: numeric('vocabulary_score', { precision: 5, scale: 2 }),
  overallScore: numeric('overall_score', { precision: 5, scale: 2 }).notNull(),
  recommendedLevel: text('recommended_level').notNull(), // 'beginner', 'intermediate', 'advanced'
  createdAt: timestamp('created_at').defaultNow(),
});

// Assessment audit logs table - Audit trail
export const assessmentAuditLogs = pgTable('assessment_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull(),
  actionType: text('action_type').notNull(), // 'question_created', 'question_updated', 'test_started', 'test_completed', 'placement_assigned', etc.
  targetId: uuid('target_id').notNull(),
  oldValue: jsonb('old_value').$type<any>(),
  newValue: jsonb('new_value').$type<any>(),
  createdAt: timestamp('created_at').defaultNow(),
});

// ============================================================================
// PHASE 10: PLACEMENT TEST RELATIONS
// ============================================================================

export const assessmentQuestionsRelations = relations(assessmentQuestions, ({ many }) => ({
  responses: many(assessmentResponses),
}));

export const assessmentTestsRelations = relations(assessmentTests, ({ many }) => ({
  sections: many(assessmentSections),
  attempts: many(assessmentAttempts),
}));

export const assessmentSectionsRelations = relations(assessmentSections, ({ one }) => ({
  test: one(assessmentTests, {
    fields: [assessmentSections.testId],
    references: [assessmentTests.id],
  }),
}));

export const assessmentAttemptsRelations = relations(assessmentAttempts, ({ one, many }) => ({
  test: one(assessmentTests, {
    fields: [assessmentAttempts.testId],
    references: [assessmentTests.id],
  }),
  responses: many(assessmentResponses),
  placementResult: one(placementResults),
}));

export const assessmentResponsesRelations = relations(assessmentResponses, ({ one }) => ({
  attempt: one(assessmentAttempts, {
    fields: [assessmentResponses.attemptId],
    references: [assessmentAttempts.id],
  }),
  question: one(assessmentQuestions, {
    fields: [assessmentResponses.questionId],
    references: [assessmentQuestions.id],
  }),
}));

export const placementResultsRelations = relations(placementResults, ({ one }) => ({
  attempt: one(assessmentAttempts, {
    fields: [placementResults.attemptId],
    references: [assessmentAttempts.id],
  }),
}));


// ============================================================================
// PROFILES — centralized per-user table for auth-linked gamification state.
//
// Supabase/Neon is used ONLY for: auth, XP, coins, daily streak, SRS progress,
// selected dialect, and role — never for learning content (words/phrases/
// grammar always come from /data via src/lib/content/reader.ts).
//
// id matches the Supabase auth.users.id (uuid). A trigger on auth.users
// (see drizzle/0021_phase_profiles.sql) inserts a row here automatically
// whenever a new user signs up, so every authenticated user has exactly
// one profiles row from the moment they're created.
// ============================================================================
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // = auth.users.id
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('student').$type<'student' | 'teacher' | 'admin_super' | 'owner'>(),
  selectedDialect: text('selected_dialect').$type<
    'sorani' | 'kurmanji' | 'bahdini' | 'kalhory' | 'leki' | 'hawrami' | 'jafi'
  >(),
  xp: integer('xp').notNull().default(0),
  coins: integer('coins').notNull().default(0),
  streakDays: integer('streak_days').notNull().default(0),
  lastActive: timestamp('last_active').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
