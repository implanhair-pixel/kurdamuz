import { db } from '@/db';
import {
  courses,
  courseCategories,
  courseModules,
  lessons,
  lessonAssets,
  lessonVocabulary,
  vocabulary,
  lessonGrammar,
  grammarTopics,
} from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

/**
 * Fetches a single course with its category, modules, lessons and lesson
 * relations (assets / vocabulary / grammar), fully nested, mirroring the
 * shape previously returned by the Supabase REST `select` query.
 *
 * Replaces direct `supabaseAdmin.from('courses')...` calls — content now
 * lives in Neon Postgres via Drizzle, not in Supabase's own Postgres
 * (Supabase is reserved for Auth/XP/Coins/Streak/SRS/Role per project rules).
 */
export async function getCourseWithModules(courseId: string) {
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) return null;

  const [category] = course.categoryId
    ? await db.select().from(courseCategories).where(eq(courseCategories.id, course.categoryId)).limit(1)
    : [null];

  const modules = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, course.id))
    .orderBy(asc(courseModules.sortOrder));

  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => {
      const moduleLessons = await db
        .select()
        .from(lessons)
        .where(eq(lessons.moduleId, module.id))
        .orderBy(asc(lessons.sortOrder));

      const lessonsWithRelations = await Promise.all(
        moduleLessons.map(async (lesson) => {
          const assets = await db.select().from(lessonAssets).where(eq(lessonAssets.lessonId, lesson.id));

          const vocabLinks = await db
            .select({ link: lessonVocabulary, word: vocabulary })
            .from(lessonVocabulary)
            .leftJoin(vocabulary, eq(lessonVocabulary.vocabularyId, vocabulary.id))
            .where(eq(lessonVocabulary.lessonId, lesson.id));

          const grammarLinks = await db
            .select({ link: lessonGrammar, topic: grammarTopics })
            .from(lessonGrammar)
            .leftJoin(grammarTopics, eq(lessonGrammar.grammarTopicId, grammarTopics.id))
            .where(eq(lessonGrammar.lessonId, lesson.id));

          return {
            ...lesson,
            assets,
            vocabulary: vocabLinks.map((v) => ({ ...v.link, vocabulary: v.word })),
            grammar: grammarLinks.map((g) => ({ ...g.link, grammarTopic: g.topic })),
          };
        }),
      );

      return { ...module, lessons: lessonsWithRelations };
    }),
  );

  return { ...course, category, modules: modulesWithLessons };
}

/** Lightweight list (no nested lessons) for catalog/listing endpoints. */
export async function listCoursesWithModules(publishedOnly: boolean) {
  const allCourses = publishedOnly
    ? await db.select().from(courses).where(eq(courses.isPublished, true)).orderBy(asc(courses.createdAt))
    : await db.select().from(courses).orderBy(asc(courses.createdAt));

  return Promise.all(
    allCourses.map(async (course) => {
      const [category] = course.categoryId
        ? await db.select().from(courseCategories).where(eq(courseCategories.id, course.categoryId)).limit(1)
        : [null];

      const modules = await db
        .select()
        .from(courseModules)
        .where(eq(courseModules.courseId, course.id))
        .orderBy(asc(courseModules.sortOrder));

      const modulesWithLessons = await Promise.all(
        modules.map(async (module) => {
          const moduleLessons = await db
            .select()
            .from(lessons)
            .where(eq(lessons.moduleId, module.id))
            .orderBy(asc(lessons.sortOrder));
          return { ...module, lessons: moduleLessons };
        }),
      );

      return { ...course, category, modules: modulesWithLessons };
    }),
  );
}
