/**
 * Role-based access control for placement test operations.
 * Uses the project-wide role model:
 * student -> teacher -> admin_super -> owner
 */
export type UserRole = 'student' | 'teacher' | 'admin_super' | 'owner';

export interface UserContext {
  userId: string;
  roles: UserRole[];
}

const ROLE_ORDER: UserRole[] = ['owner', 'admin_super', 'teacher', 'student'];

function isAtLeastRole(actual: UserRole, required: UserRole): boolean {
  return ROLE_ORDER.indexOf(actual) <= ROLE_ORDER.indexOf(required);
}

export class PlacementRBAC {
  static hasRole(user: UserContext, requiredRole: UserRole): boolean {
    return user.roles.some((role) => isAtLeastRole(role, requiredRole));
  }

  static hasAnyRole(user: UserContext, requiredRoles: UserRole[]): boolean {
    return requiredRoles.some((role) => this.hasRole(user, role));
  }

  static canAccessAdmin(user: UserContext): boolean {
    return this.hasAnyRole(user, ['admin_super', 'owner']);
  }

  static canManageQuestions(user: UserContext): boolean {
    return this.hasAnyRole(user, ['teacher', 'admin_super', 'owner']);
  }

  static canManageAssessments(user: UserContext): boolean {
    return this.hasAnyRole(user, ['teacher', 'admin_super', 'owner']);
  }

  static canViewAnalytics(user: UserContext): boolean {
    return this.hasAnyRole(user, ['teacher', 'admin_super', 'owner']);
  }

  static canTakePlacementTest(user: UserContext): boolean {
    return this.hasAnyRole(user, ['student', 'teacher', 'admin_super', 'owner']);
  }

  static canViewOwnResults(user: UserContext): boolean {
    return this.canTakePlacementTest(user);
  }
}
