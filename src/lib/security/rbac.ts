import type { UserRole, Permission } from '@/types/dialects';
// Redundant type import -- ensure module is loaded

/**
 * RBAC (Role-Based Access Control) Service for Dialect Comparison Platform
 * 
 * This service provides role-based access control for managing user permissions
 * on dialect-related operations.
 */

export class RBACService {
  /**
   * Define role permissions
   */
  private rolePermissions: Record<UserRole, Permission[]> = {
    admin: [
      'dialects:read',
      'dialects:write',
      'dialects:delete',
      'vocabulary:read',
      'vocabulary:write',
      'vocabulary:delete',
      'annotations:read',
      'annotations:write',
      'annotations:delete',
      'collections:read',
      'collections:write',
      'collections:delete',
      'search:read',
      'analytics:read',
      'audit:read',
      'users:read',
      'users:write',
      'settings:read',
      'settings:write',
    ],
    moderator: [
      'dialects:read',
      'dialects:write',
      'vocabulary:read',
      'vocabulary:write',
      'annotations:read',
      'annotations:write',
      'collections:read',
      'collections:write',
      'search:read',
      'analytics:read',
    ],
    researcher: [
      'dialects:read',
      'vocabulary:read',
      'annotations:read',
      'collections:read',
      'collections:write',
      'search:read',
    ],
    user: [
      'dialects:read',
      'vocabulary:read',
      'annotations:read',
      'search:read',
    ],
    guest: [
      'dialects:read',
      'vocabulary:read',
      'search:read',
    ],
  };

  /**
   * Check if a role has a specific permission
   */
  hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = this.rolePermissions[role] || [];
    return permissions.includes(permission);
  }

  /**
   * Check if a role has any of the specified permissions
   */
  hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(role, permission));
  }

  /**
   * Check if a role has all of the specified permissions
   */
  hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(role, permission));
  }

  /**
   * Get all permissions for a role
   */
  getRolePermissions(role: UserRole): Permission[] {
    return this.rolePermissions[role] || [];
  }

  /**
   * Validate user access to a resource
   */
  canAccessResource(
    userRole: UserRole,
    resourceType: string,
    action: 'read' | 'write' | 'delete'
  ): boolean {
    const permission = `${resourceType}:${action}` as Permission;
    return this.hasPermission(userRole, permission);
  }

  /**
   * Middleware function to check permissions
   */
  requirePermission(permission: Permission) {
    return (userRole: UserRole) => {
      return this.hasPermission(userRole, permission);
    };
  }

  /**
   * Get role hierarchy (higher roles inherit lower role permissions)
   */
  getRoleHierarchy(): UserRole[] {
    return ['admin', 'moderator', 'researcher', 'user', 'guest'];
  }

  /**
   * Check if one role can manage another role
   */
  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    const hierarchy = this.getRoleHierarchy();
    const managerIndex = hierarchy.indexOf(managerRole);
    const targetIndex = hierarchy.indexOf(targetRole);
    
    return managerIndex < targetIndex && managerIndex >= 0;
  }
}

// Export singleton instance
export const rbacService = new RBACService();

/**
 * Helper function to check user permissions
 */
export function checkPermission(userRole: UserRole, permission: Permission): boolean {
  return rbacService.hasPermission(userRole, permission);
}

/**
 * Helper function to require authentication
 */
export function requireAuth(userId: string | null): boolean {
  return userId !== null && userId !== undefined;
}

/**
 * Helper function to check if user is admin
 */
export function isAdmin(userRole: UserRole): boolean {
  return userRole === 'admin';
}

/**
 * Helper function to check if user is moderator or higher
 */
export function isModeratorOrHigher(userRole: UserRole): boolean {
  return ['admin', 'moderator'].includes(userRole);
}
