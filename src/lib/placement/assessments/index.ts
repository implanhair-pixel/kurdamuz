import { db } from '@/db/index';
import { assessmentTests, assessmentAttempts, assessmentResponses, assessmentSections } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { 
  Assessment, 
  AssessmentAttempt, 
  AssessmentResponse, 
  CreateAssessmentInput, 
  StartAttemptInput, 
  SubmitResponseInput,
  AttemptStatus 
} from './types';

export class AssessmentManager {
  /**
   * Create a new assessment
   */
  static async create(input: CreateAssessmentInput): Promise<Assessment> {
    const [assessment] = await db.insert(assessmentTests).values({
      name: input.name,
      description: input.description || null,
      assessmentType: input.assessmentType,
      status: input.status || 'active',
    }).returning();

    return assessment as Assessment;
  }

  /**
   * Get assessment by ID
   */
  static async getById(id: string): Promise<Assessment | null> {
    const [assessment] = await db.select().from(assessmentTests).where(eq(assessmentTests.id, id));
    return assessment as Assessment || null;
  }

  /**
   * Get all active assessments
   */
  static async getActive(): Promise<Assessment[]> {
    const assessments = await db
      .select()
      .from(assessmentTests)
      .where(eq(assessmentTests.status, 'active'));
    return assessments as Assessment[];
  }

  /**
   * Update an assessment
   */
  static async update(
    id: string,
    input: Partial<CreateAssessmentInput>
  ): Promise<Assessment> {
    const values: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) values.name = input.name;
    if (input.description !== undefined) values.description = input.description ?? null;
    if (input.assessmentType !== undefined) values.assessmentType = input.assessmentType;
    if (input.status !== undefined) values.status = input.status;

    const [assessment] = await db
      .update(assessmentTests)
      .set(values)
      .where(eq(assessmentTests.id, id))
      .returning();

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    return assessment as Assessment;
  }

  /**
   * Start a new assessment attempt
   */
  static async startAttempt(input: StartAttemptInput): Promise<AssessmentAttempt> {
    const [attempt] = await db.insert(assessmentAttempts).values({
      userId: input.userId,
      testId: input.testId,
      status: 'in_progress',
      startedAt: new Date(),
    }).returning();

    return attempt as AssessmentAttempt;
  }

  /**
   * Get attempt by ID
   */
  static async getAttemptById(id: string): Promise<AssessmentAttempt | null> {
    const [attempt] = await db.select().from(assessmentAttempts).where(eq(assessmentAttempts.id, id));
    return attempt as AssessmentAttempt || null;
  }

  /**
   * Get user's attempts
   */
  static async getUserAttempts(userId: string): Promise<AssessmentAttempt[]> {
    const attempts = await db
      .select()
      .from(assessmentAttempts)
      .where(eq(assessmentAttempts.userId, userId))
      .orderBy(desc(assessmentAttempts.startedAt));
    return attempts as AssessmentAttempt[];
  }

  /**
   * Submit a response
   */
  static async submitResponse(input: SubmitResponseInput): Promise<AssessmentResponse> {
    const [response] = await db.insert(assessmentResponses).values({
      attemptId: input.attemptId,
      questionId: input.questionId,
      responseData: input.responseData,
      score: null,
      evaluatedAt: null,
    }).returning();

    return response as AssessmentResponse;
  }

  /**
   * Get responses for an attempt
   */
  static async getAttemptResponses(attemptId: string): Promise<AssessmentResponse[]> {
    const responses = await db
      .select()
      .from(assessmentResponses)
      .where(eq(assessmentResponses.attemptId, attemptId));
    return responses as AssessmentResponse[];
  }

  /**
   * Complete an attempt
   */
  static async completeAttempt(
    attemptId: string, 
    overallScore: number, 
    placementLevel: string
  ): Promise<AssessmentAttempt> {
    const [attempt] = await db
      .update(assessmentAttempts)
      .set({
        status: 'completed',
        completedAt: new Date(),
        overallScore: overallScore.toString(),
        placementLevel: placementLevel as AssessmentAttempt['placementLevel'],
      })
      .where(eq(assessmentAttempts.id, attemptId))
      .returning();

    return attempt as AssessmentAttempt;
  }

  /**
   * Get assessment sections
   */
  static async getSections(testId: string) {
    const sections = await db
      .select()
      .from(assessmentSections)
      .where(eq(assessmentSections.testId, testId));
    return sections;
  }

  /**
   * Update attempt status
   */
  static async updateAttemptStatus(
    attemptId: string, 
    status: AttemptStatus
  ): Promise<void> {
    await db
      .update(assessmentAttempts)
      .set({ status })
      .where(eq(assessmentAttempts.id, attemptId));
  }
}
