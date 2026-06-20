import type { UserRole, Permission } from '@/types/dialects';

/**
 * RBAC (Role-Based Access Control) Service for the dialect/content layer.
 * Roles now follow the project-wide model:
 * student -> teacher -> admin_super -> owner
 */
const ROLE_HIERARCHY: UserRole[] = ['owner', 'admin_super', 'teacher', 'student'];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
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
  admin_super: [
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
  teacher: [
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
  student: [
    'dialects:read',
    'vocabulary:read',
    'annotations:read',
    'collections:read',
    'search:read',
  ],
};

export class RBACService {
  hasPermission(role: UserRole, permission: Permission): boolean {
    return (ROLE_PERMISSIONS[role] || []).includes(permission);
  }

  hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
    return permissions.some((permission) => this.hasPermission(role, permission));
  }

  hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
    return permissions.every((permission) => this.hasPermission(role, permission));
  }

  getRolePermissions(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  canAccessResource(
    userRole: UserRole,
    resourceType: string,
    action: 'read' | 'write' | 'delete'
  ): boolean {
    return this.hasPermission(userRole, `${resourceType}:${action}` as Permission);
  }

  requirePermission(permission: Permission) {
    return (userRole: UserRole) => this.hasPermission(userRole, permission);
  }

  getRoleHierarchy(): UserRole[] {
    return [...ROLE_HIERARCHY];
  }

  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    return ROLE_HIERARCHY.indexOf(managerRole) < ROLE_HIERARCHY.indexOf(targetRole);
  }
}

export const rbacService = new RBACService();

export function checkPermission(userRole: UserRole, permission: Permission): boolean {
  return rbacService.hasPermission(userRole, permission);
}

export function requireAuth(userId: string | null): boolean {
  return userId !== null && userId !== undefined;
}

export function isAdmin(userRole: UserRole): boolean {
  return ['admin_super', 'owner'].includes(userRole);
}

export function isModeratorOrHigher(userRole: UserRole): boolean {
  return ['teacher', 'admin_super', 'owner'].includes(userRole);
}
