import { db } from '@/db/index';
import { assessmentQuestions } from '@/db/schema';
import { eq, and, inArray, sql } from 'drizzle-orm';
import type { 
  Question, 
  CreateQuestionInput, 
  UpdateQuestionInput, 
  QuestionFilter,
  QuestionType,
  SkillDomain,
  DifficultyLevel 
} from './types';
import { createQuestionSchema, updateQuestionSchema } from './validators';

export class QuestionBank {
  /**
   * Create a new question
   */
  static async create(input: CreateQuestionInput): Promise<Question> {
    const validated = createQuestionSchema.parse(input);
    
    const [question] = await db.insert(assessmentQuestions).values({
      questionType: validated.questionType,
      skillDomain: validated.skillDomain,
      difficultyLevel: validated.difficultyLevel,
      content: validated.content,
      correctAnswer: validated.correctAnswer,
      metadata: validated.metadata || { points: 1 },
      status: validated.status || 'active',
      version: 1,
    }).returning();

    return question as Question;
  }

  /**
   * Get question by ID
   */
  static async getById(id: string): Promise<Question | null> {
    const [question] = await db.select().from(assessmentQuestions).where(eq(assessmentQuestions.id, id));
    return question as Question || null;
  }

  /**
   * Get questions by filter
   */
  static async getByFilter(filter: QuestionFilter): Promise<Question[]> {
    const conditions = [];
    
    if (filter.skillDomain) {
      conditions.push(eq(assessmentQuestions.skillDomain, filter.skillDomain));
    }
    if (filter.difficultyLevel) {
      conditions.push(eq(assessmentQuestions.difficultyLevel, filter.difficultyLevel));
    }
    if (filter.questionType) {
      conditions.push(eq(assessmentQuestions.questionType, filter.questionType));
    }
    if (filter.status) {
      conditions.push(eq(assessmentQuestions.status, filter.status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const questions = await db.select().from(assessmentQuestions).where(whereClause);
    return questions as Question[];
  }

  /**
   * Get questions for a specific skill domain and difficulty
   */
  static async getQuestionsForSkill(
    skillDomain: SkillDomain,
    difficultyLevel: DifficultyLevel,
    limit: number = 10
  ): Promise<Question[]> {
    const questions = await db
      .select()
      .from(assessmentQuestions)
      .where(
        and(
          eq(assessmentQuestions.skillDomain, skillDomain),
          eq(assessmentQuestions.difficultyLevel, difficultyLevel),
          eq(assessmentQuestions.status, 'active')
        )
      )
      .limit(limit);

    return questions as Question[];
  }

  /**
   * Get random questions for a test
   */
  static async getRandomQuestions(
    skillDomains: SkillDomain[],
    countPerDomain: number = 10
  ): Promise<Question[]> {
    const allQuestions: Question[] = [];

    for (const domain of skillDomains) {
      const questions = await db
        .select()
        .from(assessmentQuestions)
        .where(
          and(
            eq(assessmentQuestions.skillDomain, domain),
            eq(assessmentQuestions.status, 'active')
          )
        );

      // Shuffle and take requested count
      const shuffled = questions.sort(() => Math.random() - 0.5);
      allQuestions.push(...(shuffled.slice(0, countPerDomain) as Question[]));
    }

    return allQuestions;
  }

  /**
   * Update question
   */
  static async update(id: string, input: UpdateQuestionInput): Promise<Question> {
    const validated = updateQuestionSchema.parse(input);
    
    const [question] = await db
      .update(assessmentQuestions)
      .set({
        ...validated,
        updatedAt: new Date(),
        version: sql`version + 1`,
      })
      .where(eq(assessmentQuestions.id, id))
      .returning();

    return question as Question;
  }

  /**
   * Delete question (soft delete by archiving)
   */
  static async delete(id: string): Promise<void> {
    await db
      .update(assessmentQuestions)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(assessmentQuestions.id, id));
  }

  /**
   * Get question statistics
   */
  static async getStatistics(): Promise<{
    total: number;
    bySkillDomain: Record<SkillDomain, number>;
    byDifficulty: Record<DifficultyLevel, number>;
    byType: Record<string, number>;
  }> {
    const questions = await db.select().from(assessmentQuestions);
    
    const stats = {
      total: questions.length,
      bySkillDomain: {
        reading: 0,
        writing: 0,
        listening: 0,
        speaking: 0,
        grammar: 0,
        vocabulary: 0,
      },
      byDifficulty: {
        beginner: 0,
        intermediate: 0,
        advanced: 0,
      },
      byType: {} as Record<string, number>,
    };

    for (const q of questions) {
      stats.bySkillDomain[q.skillDomain as keyof typeof stats.bySkillDomain]++;
      stats.byDifficulty[q.difficultyLevel as keyof typeof stats.byDifficulty]++;
      stats.byType[q.questionType] = (stats.byType[q.questionType] || 0) + 1;
    }

    return stats;
  }
}
