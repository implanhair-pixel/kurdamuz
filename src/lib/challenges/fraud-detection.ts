// src/lib/challenges/fraud-detection.ts
import { db } from '@/db';
import { challengeSubmissions } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';

interface FraudDetectionInput {
  userId: string;
  submissionData: Record<string, any>;
  timeTaken?: number;
  scheduleId?: string;
}

export async function detectFraud(input: FraudDetectionInput): Promise<number> {
  let fraudScore = 0;

  // 1. Time-based detection (too fast completion)
  if (input.timeTaken) {
    const expectedTime = calculateExpectedTime(input.submissionData);
    if (input.timeTaken < expectedTime * 0.5) {
      fraudScore += 30; // Suspiciously fast
    }
  }

  // 2. Pattern detection (identical submissions)
  const recentSubmissions = await getRecentSubmissions(input.userId);
  for (const submission of recentSubmissions) {
    const similarity = calculateSimilarity(
      input.submissionData,
      submission.submissionData
    );
    if (similarity > 0.9) {
      fraudScore += 40; // Near-identical submission
      break;
    }
  }

  // 3. Answer pattern detection
  const patternScore = detectAnswerPatterns(input.submissionData);
  fraudScore += patternScore;

  // 4. Device fingerprinting (placeholder for future implementation)
  const deviceScore = await detectDeviceAnomalies(input.userId);
  fraudScore += deviceScore;

  // 5. Frequency detection (too many submissions in short time)
  const frequencyScore = await detectSubmissionFrequency(input.userId);
  fraudScore += frequencyScore;

  return Math.min(fraudScore, 100);
}

function calculateExpectedTime(submissionData: Record<string, any>): number {
  // Calculate expected time based on question count and complexity
  const questionCount = Object.keys(submissionData).length;
  return questionCount * 30; // 30 seconds per question average
}

async function getRecentSubmissions(userId: string) {
  try {
    const oneHourAgo = new Date(Date.now() - 3600000); // Last hour
    return await db.query.challengeSubmissions.findMany({
      where: and(
        eq(challengeSubmissions.userId, userId),
        gte(challengeSubmissions.submittedAt, oneHourAgo)
      ),
      limit: 10,
    });
  } catch (error) {
    console.error('Error fetching recent submissions:', error);
    return [];
  }
}

function calculateSimilarity(
  data1: Record<string, any>,
  data2: Record<string, any>
): number {
  const keys1 = Object.keys(data1);
  const keys2 = Object.keys(data2);

  if (keys1.length !== keys2.length) return 0;

  let matches = 0;
  for (const key of keys1) {
    if (data1[key] === data2[key]) matches++;
  }

  return matches / keys1.length;
}

function detectAnswerPatterns(submissionData: Record<string, any>): number {
  // Detect patterns like all A's, alternating patterns, etc.
  const answers = Object.values(submissionData);
  let patternScore = 0;

  // Check for all same answers
  if (answers.length > 2 && answers.every((a) => a === answers[0])) {
    patternScore += 20;
  }

  // Check for simple alternating pattern
  const isAlternating =
    answers.length > 4 &&
    answers.every((val, i) => i === 0 || val === answers[i % 2]);
  if (isAlternating) {
    patternScore += 15;
  }

  // Check for sequential pattern (A, B, C, D...)
  const isSequential = answers.every((val, i) => {
    if (i === 0) return true;
    const prev = answers[i - 1];
    // Check if current is next in sequence
    return val === getNextInSequence(prev);
  });
  if (isSequential && answers.length > 3) {
    patternScore += 10;
  }

  return patternScore;
}

function getNextInSequence(val: any): any {
  // Simple sequence detection for letters
  if (typeof val === 'string' && val.length === 1) {
    const code = val.charCodeAt(0);
    if (code >= 65 && code < 90) return String.fromCharCode(code + 1); // A-Z
    if (code >= 97 && code < 122) return String.fromCharCode(code + 1); // a-z
  }
  return val;
}

async function detectDeviceAnomalies(userId: string): Promise<number> {
  // Placeholder for device fingerprinting
  // This would track user agent, IP, browser fingerprint, etc.
  // For now, return 0
  return 0;
}

async function detectSubmissionFrequency(userId: string): Promise<number> {
  try {
    // Check if user has submitted too many challenges in the last hour
    const oneHourAgo = new Date(Date.now() - 3600000);
    const recentCount = await db
      .select()
      .from(challengeSubmissions)
      .where(
        and(
          eq(challengeSubmissions.userId, userId),
          gte(challengeSubmissions.submittedAt, oneHourAgo)
        )
      );

    // More than 10 submissions in an hour is suspicious
    if (recentCount.length > 10) {
      return 20;
    }

    // More than 5 submissions in an hour is moderately suspicious
    if (recentCount.length > 5) {
      return 10;
    }

    return 0;
  } catch (error) {
    console.error('Error detecting submission frequency:', error);
    return 0;
  }
}

export function getFraudThreshold(fraudScore: number): 'low' | 'medium' | 'high' {
  if (fraudScore < 30) return 'low';
  if (fraudScore < 70) return 'medium';
  return 'high';
}

export function shouldFlagSubmission(fraudScore: number): boolean {
  return fraudScore >= 70;
}

export function shouldAutoReject(fraudScore: number): boolean {
  return fraudScore >= 90;
}
