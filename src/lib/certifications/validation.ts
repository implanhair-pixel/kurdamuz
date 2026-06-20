import { db } from '@/db';
import { learningCertificates } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { CertificateValidationResult } from '@/types/learning-paths';

/**
 * Verify a certificate by number
 */
export async function verifyCertificate(certificateNumber: string): Promise<CertificateValidationResult> {
  const certificate = await db
    .select()
    .from(learningCertificates)
    .where(eq(learningCertificates.certificateNumber, certificateNumber))
    .limit(1);

  if (!certificate[0]) {
    return {
      isValid: false,
      certificate: null,
      expirationStatus: 'revoked',
    };
  }

  const cert = certificate[0];

  // Check if certificate is revoked
  if (cert.status === 'revoked') {
    return {
      isValid: false,
      certificate: cert,
      expirationStatus: 'revoked',
      revocationReason: 'Certificate has been revoked',
    };
  }

  // Check if certificate is expired (if expiration logic is added)
  // For now, certificates don't expire unless revoked

  return {
    isValid: true,
    certificate: cert,
    expirationStatus: 'valid',
  };
}

/**
 * Validate certificate ownership
 */
export async function validateCertificateOwnership(
  certificateNumber: string,
  userId: string
): Promise<boolean> {
  const certificate = await db
    .select()
    .from(learningCertificates)
    .where(
      eq(learningCertificates.certificateNumber, certificateNumber)
    )
    .limit(1);

  if (!certificate[0]) return false;

  return certificate[0].userId === userId;
}

/**
 * Check if a certificate exists
 */
export async function certificateExists(certificateNumber: string): Promise<boolean> {
  const certificate = await db
    .select()
    .from(learningCertificates)
    .where(eq(learningCertificates.certificateNumber, certificateNumber))
    .limit(1);

  return certificate.length > 0;
}

/**
 * Validate certificate data integrity
 */
export async function validateCertificateIntegrity(certificateId: string): Promise<boolean> {
  const certificate = await db
    .select()
    .from(learningCertificates)
    .where(eq(learningCertificates.id, certificateId))
    .limit(1);

  if (!certificate[0]) return false;

  const cert = certificate[0];

  // Validate required fields
  if (!cert.userId || !cert.pathId || !cert.certificateNumber) {
    return false;
  }

  // Validate status
  if (!['issued', 'revoked'].includes(cert.status)) {
    return false;
  }

  // Validate issued date
  if (!cert.issuedAt) {
    return false;
  }

  return true;
}

/**
 * Batch validate multiple certificates
 */
export async function batchValidateCertificates(certificateNumbers: string[]): Promise<
  Record<string, CertificateValidationResult>
> {
  const results: Record<string, CertificateValidationResult> = {};

  for (const number of certificateNumbers) {
    results[number] = await verifyCertificate(number);
  }

  return results;
}
