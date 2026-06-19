// src/lib/challenges/validation.ts
import { db } from '@/db';
import { challengeSchedules, challengeDefinitions, challengeSubmissions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { ChallengeType } from '@/types/challenges';

interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export async function validateSubmission(
  scheduleId: string,
  userId: string,
  submissionData: Record<string, any>
): Promise<ValidationResult> {
  const errors: string[] = [];

  // 1. Validate schedule exists and is active
  const schedule = await db.query.challengeSchedules.findFirst({
    where: eq(challengeSchedules.id, scheduleId),
  });

  if (!schedule) {
    errors.push('Challenge schedule not found');
    return { valid: false, errors };
  }

  if (schedule.status !== 'active') {
    errors.push('Challenge is not currently active');
    return { valid: false, errors };
  }

  // 2. Validate challenge hasn't ended
  if (schedule.endDate && new Date() > new Date(schedule.endDate)) {
    errors.push('Challenge has ended');
    return { valid: false, errors };
  }

  // 3. Validate challenge hasn't started yet
  if (new Date() < new Date(schedule.scheduledTime)) {
    errors.push('Challenge has not started yet');
    return { valid: false, errors };
  }

  // 4. Get challenge definition
  const definition = await db.query.challengeDefinitions.findFirst({
    where: eq(challengeDefinitions.id, schedule.challengeDefinitionId),
  });

  if (!definition) {
    errors.push('Challenge definition not found');
    return { valid: false, errors };
  }

  // 5. Validate max attempts
  if (definition.maxAttempts) {
    const existingSubmissions = await db.query.challengeSubmissions.findMany({
      where: and(
        eq(challengeSubmissions.scheduleId, scheduleId),
        eq(challengeSubmissions.userId, userId)
      ),
    });

    if (existingSubmissions.length >= definition.maxAttempts) {
      errors.push(`Maximum attempts (${definition.maxAttempts}) reached`);
      return { valid: false, errors };
    }
  }

  // 6. Validate submission data structure based on challenge type
  const structureValidation = validateSubmissionStructure(
    definition.challengeType as ChallengeType,
    submissionData
  );

  if (!structureValidation.valid) {
    errors.push(...structureValidation.errors);
  }

  // 7. Validate required fields
  const requiredFieldsValidation = validateRequiredFields(
    definition.challengeType as ChallengeType,
    submissionData
  );

  if (!requiredFieldsValidation.valid) {
    errors.push(...requiredFieldsValidation.errors);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateSubmissionStructure(
  challengeType: ChallengeType,
  submissionData: Record<string, any>
): ValidationResult {
  const errors: string[] = [];

  // Ensure submission data is an object
  if (typeof submissionData !== 'object' || submissionData === null) {
    errors.push('Submission data must be an object');
    return { valid: false, errors };
  }

  // Ensure submission data is not empty
  if (Object.keys(submissionData).length === 0) {
    errors.push('Submission data cannot be empty');
    return { valid: false, errors };
  }

  // Type-specific validations
  switch (challengeType) {
    case ChallengeType.QUIZ:
      if (!validateQuizStructure(submissionData)) {
        errors.push('Invalid quiz submission structure');
      }
      break;

    case ChallengeType.VOCABULARY:
      if (!validateVocabularyStructure(submissionData)) {
        errors.push('Invalid vocabulary submission structure');
      }
      break;

    case ChallengeType.TRANSLATION:
      if (!validateTranslationStructure(submissionData)) {
        errors.push('Invalid translation submission structure');
      }
      break;

    default:
      // For other types, just ensure it's a valid object
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function validateQuizStructure(submissionData: Record<string, any>): boolean {
  // Quiz submissions should have question IDs as keys and answer values
  for (const key in submissionData) {
    const value = submissionData[key];
    
    // Answer should be a string or number
    if (typeof value !== 'string' && typeof value !== 'number') {
      return false;
    }
  }

  return true;
}

function validateVocabularyStructure(submissionData: Record<string, any>): boolean {
  // Vocabulary submissions should have word IDs as keys and translation values
  for (const key in submissionData) {
    const value = submissionData[key];
    
    // Translation should be a string
    if (typeof value !== 'string') {
      return false;
    }
  }

  return true;
}

function validateTranslationStructure(submissionData: Record<string, any>): boolean {
  // Translation submissions should have sentence IDs as keys and translation values
  for (const key in submissionData) {
    const value = submissionData[key];
    
    // Translation should be a string
    if (typeof value !== 'string') {
      return false;
    }
  }

  return true;
}

function validateRequiredFields(
  challengeType: ChallengeType,
  submissionData: Record<string, any>
): ValidationResult {
  const errors: string[] = [];

  // Different challenge types may require different fields
  // This is a basic validation that can be extended

  switch (challengeType) {
    case ChallengeType.QUIZ:
      // Quiz should have at least one answer
      if (Object.keys(submissionData).length === 0) {
        errors.push('Quiz submission must contain at least one answer');
      }
      break;

    case ChallengeType.VOCABULARY:
      // Vocabulary should have at least one translation
      if (Object.keys(submissionData).length === 0) {
        errors.push('Vocabulary submission must contain at least one translation');
      }
      break;

    case ChallengeType.TRANSLATION:
      // Translation should have at least one translation
      if (Object.keys(submissionData).length === 0) {
        errors.push('Translation submission must contain at least one translation');
      }
      break;

    default:
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export async function validateReviewPermission(
  submissionId: string,
  userId: string
): Promise<boolean> {
  // Check if user has permission to review this submission
  // This would typically check if the user is a teacher, admin, or has specific permissions
  
  // For now, return true (this should be enhanced with proper RBAC)
  return true;
}

export async function validateScheduleApproval(
  scheduleId: string,
  userId: string
): Promise<boolean> {
  // Check if user has permission to approve this schedule
  // This would typically check if the user is an admin or has specific permissions
  
  // For now, return true (this should be enhanced with proper RBAC)
  return true;
}
