import { db } from '@/db';
import {
  learningPrograms,
  learningPaths,
  learningModules,
  learningUnits,
  learningLessons,
} from '@/db/schema';
import { eq, asc, and } from 'drizzle-orm';
import type {
  LearningPathHierarchy,
  LearningModuleWithUnits,
  LearningUnitWithLessons,
  LearningLessonWithContent,
} from '@/types/learning-paths';

/**
 * Get full learning path hierarchy including program, path, modules, units, and lessons
 */
export async function getLearningPathHierarchy(pathId: string): Promise<LearningPathHierarchy | null> {
  const path = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.id, pathId))
    .limit(1);

  if (!path[0]) return null;

  const program = await db
    .select()
    .from(learningPrograms)
    .where(eq(learningPrograms.id, path[0].programId))
    .limit(1);

  const modules = await db
    .select()
    .from(learningModules)
    .where(eq(learningModules.pathId, pathId))
    .orderBy(asc(learningModules.sequenceOrder));

  const modulesWithUnits: LearningModuleWithUnits[] = [];

  for (const module of modules) {
    const units = await db
      .select()
      .from(learningUnits)
      .where(eq(learningUnits.moduleId, module.id))
      .orderBy(asc(learningUnits.sequenceOrder));

    const unitsWithLessons: LearningUnitWithLessons[] = [];

    for (const unit of units) {
      const lessons = await db
        .select()
        .from(learningLessons)
        .where(eq(learningLessons.unitId, unit.id))
        .orderBy(asc(learningLessons.sequenceOrder));

      const lessonsWithContent: LearningLessonWithContent[] = lessons.map(lesson => ({
        ...lesson,
        activities: [], // Can be populated if needed
        assessments: [], // Can be populated if needed
      }));

      unitsWithLessons.push({
        ...unit,
        lessons: lessonsWithContent,
      });
    }

    modulesWithUnits.push({
      ...module,
      units: unitsWithLessons,
    });
  }

  return {
    program: program[0],
    path: path[0],
    modules: modulesWithUnits,
  };
}

/**
 * Get all modules with their units for a path
 */
export async function getModulesWithUnits(pathId: string): Promise<LearningModuleWithUnits[]> {
  const modules = await db
    .select()
    .from(learningModules)
    .where(eq(learningModules.pathId, pathId))
    .orderBy(asc(learningModules.sequenceOrder));

  const modulesWithUnits: LearningModuleWithUnits[] = [];

  for (const module of modules) {
    const units = await db
      .select()
      .from(learningUnits)
      .where(eq(learningUnits.moduleId, module.id))
      .orderBy(asc(learningUnits.sequenceOrder));

    const unitsWithLessons: LearningUnitWithLessons[] = [];

    for (const unit of units) {
      const lessons = await db
        .select()
        .from(learningLessons)
        .where(eq(learningLessons.unitId, unit.id))
        .orderBy(asc(learningLessons.sequenceOrder));

      unitsWithLessons.push({
        ...unit,
        lessons: lessons.map(lesson => ({
          ...lesson,
          activities: [],
          assessments: [],
        })),
      });
    }

    modulesWithUnits.push({
      ...module,
      units: unitsWithLessons,
    });
  }

  return modulesWithUnits;
}

/**
 * Get all units with their lessons for a module
 */
export async function getUnitsWithLessons(moduleId: string): Promise<LearningUnitWithLessons[]> {
  const units = await db
    .select()
    .from(learningUnits)
    .where(eq(learningUnits.moduleId, moduleId))
    .orderBy(asc(learningUnits.sequenceOrder));

  const unitsWithLessons: LearningUnitWithLessons[] = [];

  for (const unit of units) {
    const lessons = await db
      .select()
      .from(learningLessons)
      .where(eq(learningLessons.unitId, unit.id))
      .orderBy(asc(learningLessons.sequenceOrder));

    unitsWithLessons.push({
      ...unit,
      lessons: lessons.map(lesson => ({
        ...lesson,
        activities: [],
        assessments: [],
      })),
    });
  }

  return unitsWithLessons;
}

/**
 * Get the next lesson in sequence for a path
 */
export async function getNextLesson(
  pathId: string,
  currentLessonId: string
): Promise<string | null> {
  const currentLesson = await db
    .select()
    .from(learningLessons)
    .where(eq(learningLessons.id, currentLessonId))
    .limit(1);

  if (!currentLesson[0]) return null;

  const unit = await db
    .select()
    .from(learningUnits)
    .where(eq(learningUnits.id, currentLesson[0].unitId))
    .limit(1);

  if (!unit[0]) return null;

  // Try to get next lesson in current unit
  const nextLessonInUnit = await db
    .select()
    .from(learningLessons)
    .where(
      and(
        eq(learningLessons.unitId, unit[0].id),
        // sequenceOrder > currentLesson[0].sequenceOrder
      )
    )
    .orderBy(asc(learningLessons.sequenceOrder))
    .limit(1);

  if (nextLessonInUnit[0]) return nextLessonInUnit[0].id;

  // Get next unit in module
  const module = await db
    .select()
    .from(learningModules)
    .where(eq(learningModules.id, unit[0].moduleId))
    .limit(1);

  if (!module[0]) return null;

  const nextUnit = await db
    .select()
    .from(learningUnits)
    .where(
      and(
        eq(learningUnits.moduleId, module[0].id),
        // sequenceOrder > unit[0].sequenceOrder
      )
    )
    .orderBy(asc(learningUnits.sequenceOrder))
    .limit(1);

  if (nextUnit[0]) {
    const firstLesson = await db
      .select()
      .from(learningLessons)
      .where(eq(learningLessons.unitId, nextUnit[0].id))
      .orderBy(asc(learningLessons.sequenceOrder))
      .limit(1);

    if (firstLesson[0]) return firstLesson[0].id;
  }

  return null;
}

/**
 * Get the first lesson of a path
 */
export async function getFirstLessonOfPath(pathId: string): Promise<string | null> {
  const modules = await db
    .select()
    .from(learningModules)
    .where(eq(learningModules.pathId, pathId))
    .orderBy(asc(learningModules.sequenceOrder))
    .limit(1);

  if (!modules[0]) return null;

  const units = await db
    .select()
    .from(learningUnits)
    .where(eq(learningUnits.moduleId, modules[0].id))
    .orderBy(asc(learningUnits.sequenceOrder))
    .limit(1);

  if (!units[0]) return null;

  const lessons = await db
    .select()
    .from(learningLessons)
    .where(eq(learningLessons.unitId, units[0].id))
    .orderBy(asc(learningLessons.sequenceOrder))
    .limit(1);

  return lessons[0]?.id || null;
}

/**
 * Count total lessons in a path
 */
export async function countTotalLessonsInPath(pathId: string): Promise<number> {
  const modules = await db
    .select()
    .from(learningModules)
    .where(eq(learningModules.pathId, pathId));

  let totalLessons = 0;

  for (const module of modules) {
    const units = await db
      .select()
      .from(learningUnits)
      .where(eq(learningUnits.moduleId, module.id));

    for (const unit of units) {
      const lessons = await db
        .select()
        .from(learningLessons)
        .where(eq(learningLessons.unitId, unit.id));

      totalLessons += lessons.length;
    }
  }

  return totalLessons;
}
