import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { PlacementRBAC, type UserContext, type UserRole } from './rbac';
import { PlacementAuditLogger, type AuditAction } from './audit-logger';

/**
 * Security middleware for placement test API routes.
 *
 * Auth is read from the live Supabase session via cookies — the same
 * mechanism used throughout the rest of the application (see src/lib/auth.ts).
 * There is intentionally no JWT-only fast path here: roles are always
 * verified against the `profiles` table so that role changes take effect
 * immediately without requiring a re-login.
 */
export class PlacementSecurityMiddleware {
  /**
   * Build a Supabase server client using the request cookies.
   * This is safe to call from any API route handler.
   */
  private static async getSupabaseClient(request: NextRequest) {
    const cookieStore = await cookies();
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // setAll is called from a Server Component — safe to ignore.
            }
          },
        },
      }
    );
  }

  /**
   * Extract a verified UserContext from the incoming request.
   *
   * Returns null when the user is not authenticated or the Supabase
   * credentials are not configured (e.g. local dev without real keys).
   */
  static async getUserContext(request: NextRequest): Promise<UserContext | null> {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
      const isPlaceholder =
        !supabaseUrl ||
        supabaseUrl === 'https://placeholder.supabase.co' ||
        supabaseUrl.includes('placeholder');

      if (isPlaceholder) {
        // Supabase is not configured — refuse auth rather than returning a mock.
        return null;
      }

      const supabase = await this.getSupabaseClient(request);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) return null;

      // Read the live role from profiles (same logic as src/lib/auth.ts).
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role: UserRole =
        (profile?.role as UserRole | null) ??
        (user.user_metadata?.role as UserRole | null) ??
        'student';

      return {
        userId: user.id,
        roles: [role],
      };
    } catch (error) {
      console.error('[PlacementSecurityMiddleware] Error extracting user context:', error);
      return null;
    }
  }

  /**
   * Require authentication — returns 401 when the user is not signed in.
   */
  static async requireAuth(request: NextRequest): Promise<NextResponse | UserContext> {
    const user = await this.getUserContext(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return user;
  }

  /**
   * Require a specific role — returns 401 or 403 on failure.
   */
  static async requireRole(
    request: NextRequest,
    requiredRole: UserRole
  ): Promise<NextResponse | UserContext> {
    const userOrResponse = await this.requireAuth(request);

    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }

    const user = userOrResponse as UserContext;

    if (!PlacementRBAC.hasRole(user, requiredRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return user;
  }

  /**
   * Require any of the specified roles — returns 401 or 403 on failure.
   */
  static async requireAnyRole(
    request: NextRequest,
    requiredRoles: UserRole[]
  ): Promise<NextResponse | UserContext> {
    const userOrResponse = await this.requireAuth(request);

    if (userOrResponse instanceof NextResponse) {
      return userOrResponse;
    }

    const user = userOrResponse as UserContext;

    if (!PlacementRBAC.hasAnyRole(user, requiredRoles)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return user;
  }

  /**
   * Append a structured audit record for the current request.
   */
  static async logRequest(
    request: NextRequest,
    userId: string,
    action: string,
    entityId: string
  ): Promise<void> {
    const ipAddress =
      request.headers.get('x-forwarded-for') ??
      request.headers.get('x-real-ip') ??
      'unknown';
    const userAgent = request.headers.get('user-agent') ?? 'unknown';

    await PlacementAuditLogger.log({
      userId,
      action: action as AuditAction,
      entityType: 'api_request',
      entityId,
      ipAddress,
      userAgent,
    });
  }
}
