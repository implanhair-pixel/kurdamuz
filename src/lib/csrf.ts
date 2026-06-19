import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  const token = randomBytes(32).toString('hex');
  const signature = createHash('sha256')
    .update(token + CSRF_SECRET)
    .digest('hex');
  
  return `${token}.${signature}`;
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  const [tokenPart, signature] = token.split('.');
  
  if (!tokenPart || !signature) {
    return false;
  }
  
  const expectedSignature = createHash('sha256')
    .update(tokenPart + CSRF_SECRET)
    .digest('hex');
  
  return signature === expectedSignature;
}

/**
 * Set CSRF token in cookie
 */
export async function setCSRFCookie(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();
  
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  
  return token;
}

/**
 * Get CSRF token from cookie
 */
export async function getCSRFCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_COOKIE_NAME)?.value;
}

/**
 * Validate CSRF token from request
 */
export async function validateCSRFRequest(token: string): Promise<boolean> {
  const cookieToken = await getCSRFCookie();
  
  if (!cookieToken) {
    return false;
  }
  
  // Validate both the provided token and the cookie token
  return validateCSRFToken(token) && validateCSRFToken(cookieToken);
}
