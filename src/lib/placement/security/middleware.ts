import { NextRequest, NextResponse } from 'next/server';
import { PlacementRBAC, type UserContext, type UserRole } from './rbac';
import { PlacementAuditLogger } from './audit-logger';

/**
 * Security middleware for placement test API routes
 */
export class PlacementSecurityMiddleware {
  /**
   * Extract user context from request
   */
  static async getUserContext(request: NextRequest): Promise<UserContext | null> {
    try {
      // This would extract user info from Supabase auth headers
      // For now, return a mock user context
      const authHeader = request.headers.get('authorization');
      if (!authHeader) return null;

      // In production, validate JWT token and extract user info
      return {
        userId: 'mock-user-id',
        roles: ['learner'], // Default role
      };
    } catch (error) {
      console.error('Error extracting user context:', error);
      return null;
    }
  }

  /**
   * Require authentication
   */
  static async requireAuth(request: NextRequest): Promise<NextResponse | UserContext> {
    const user = await this.getUserContext(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return user;
  }

  /**
   * Require specific role
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
   * Require any of the specified roles
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
   * Log request for audit trail
   */
  static async logRequest(
    request: NextRequest,
    userId: string,
    action: string,
    entityId: string
  ): Promise<void> {
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await PlacementAuditLogger.log({
      userId,
      action: action as any,
      entityType: 'api_request',
      entityId,
      ipAddress,
      userAgent,
    });
  }
}
