import { NextResponse } from 'next/server';
import { rbacService } from './rbac';
import type { UserRole, Permission } from '@/types/dialects';

/**
 * Authorization helper functions for API routes
 */

/**
 * Check if user has required permission
 */
export function requirePermission(permission: Permission) {
  return (userRole: UserRole): boolean => {
    return rbacService.hasPermission(userRole, permission);
  };
}

/**
 * Check if user has any of the required permissions
 */
export function requireAnyPermission(permissions: Permission[]) {
  return (userRole: UserRole): boolean => {
    return rbacService.hasAnyPermission(userRole, permissions);
  };
}

/**
 * Check if user has all required permissions
 */
export function requireAllPermissions(permissions: Permission[]) {
  return (userRole: UserRole): boolean => {
    return rbacService.hasAllPermissions(userRole, permissions);
  };
}

/**
 * Create an unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  );
}

/**
 * Create a forbidden response
 */
export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  );
}

/**
 * Middleware to check user role
 */
export function withRoleCheck(requiredRole: UserRole) {
  return (userRole: UserRole): boolean => {
    const hierarchy = rbacService.getRoleHierarchy();
    const requiredIndex = hierarchy.indexOf(requiredRole);
    const userIndex = hierarchy.indexOf(userRole);
    
    return userIndex <= requiredIndex && userIndex >= 0;
  };
}

/**
 * Get user role from request (placeholder implementation)
 * In a real implementation, this would extract the user role from the session/JWT
 */
export function getUserRoleFromRequest(request: Request): UserRole {
  // Placeholder - in production, extract from session/JWT
  return 'student';
}

/**
 * Get user ID from request (placeholder implementation)
 */
export function getUserIdFromRequest(request: Request): string | null {
  // Placeholder - in production, extract from session/JWT
  return null;
}
