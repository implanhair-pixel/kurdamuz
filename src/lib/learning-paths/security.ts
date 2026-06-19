import { getCurrentUser } from '@/lib/auth';
import { db } from '@/db';
import { learningPrograms, learningPaths, userLearningProgress } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Learning Paths permission types
 */
export type LearningPathsPermission =
  | 'read:programs'
  | 'create:programs'
  | 'update:programs'
  | 'delete:programs'
  | 'read:paths'
  | 'create:paths'
  | 'update:paths'
  | 'delete:paths'
  | 'read:modules'
  | 'create:modules'
  | 'update:modules'
  | 'delete:modules'
  | 'read:lessons'
  | 'create:lessons'
  | 'update:lessons'
  | 'delete:lessons'
  | 'read:own_progress'
  | 'update:own_progress'
  | 'read:all_progress'
  | 'admin:learning_paths';

/**
 * Role-based permissions for learning paths
 */
const LEARNING_PATHS_ROLE_PERMISSIONS: Record<string, LearningPathsPermission[]> = {
  owner: [
    'read:programs', 'create:programs', 'update:programs', 'delete:programs',
    'read:paths', 'create:paths', 'update:paths', 'delete:paths',
    'read:modules', 'create:modules', 'update:modules', 'delete:modules',
    'read:lessons', 'create:lessons', 'update:lessons', 'delete:lessons',
    'read:own_progress', 'update:own_progress',
    'read:all_progress', 'admin:learning_paths',
  ],
  super_admin: [
    'read:programs', 'create:programs', 'update:programs', 'delete:programs',
    'read:paths', 'create:paths', 'update:paths', 'delete:paths',
    'read:modules', 'create:modules', 'update:modules', 'delete:modules',
    'read:lessons', 'create:lessons', 'update:lessons', 'delete:lessons',
    'read:own_progress', 'update:own_progress',
    'read:all_progress', 'admin:learning_paths',
  ],
  admin: [
    'read:programs', 'create:programs', 'update:programs', 'delete:programs',
    'read:paths', 'create:paths', 'update:paths', 'delete:paths',
    'read:modules', 'create:modules', 'update:modules', 'delete:modules',
    'read:lessons', 'create:lessons', 'update:lessons', 'delete:lessons',
    'read:own_progress', 'update:own_progress',
    'read:all_progress',
  ],
  teacher: [
    'read:programs',
    'read:paths',
    'read:modules', 'create:modules', 'update:modules',
    'read:lessons', 'create:lessons', 'update:lessons',
    'read:own_progress', 'update:own_progress',
  ],
  student: [
    'read:programs',
    'read:paths',
    'read:modules',
    'read:lessons',
    'read:own_progress', 'update:own_progress',
  ],
};

/**
 * Check if a user has a specific learning paths permission
 */
export async function hasLearningPathsPermission(
  userId: string,
  permission: LearningPathsPermission
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  const permissions = LEARNING_PATHS_ROLE_PERMISSIONS[userRole] || LEARNING_PATHS_ROLE_PERMISSIONS.student;
  return permissions.includes(permission);
}

/**
 * Require a specific learning paths permission (throws if not authorized)
 */
export async function requireLearningPathsPermission(
  permission: LearningPathsPermission
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: No user session');
  }

  const userRole = user.user_metadata?.role || 'student';
  const permissions = LEARNING_PATHS_ROLE_PERMISSIONS[userRole] || LEARNING_PATHS_ROLE_PERMISSIONS.student;

  if (!permissions.includes(permission)) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }
}

/**
 * Check if user can access a specific program
 */
export async function canAccessProgram(userId: string, programId: string): Promise<boolean> {
  // Students can access active programs
  // Admins and teachers can access all programs
  const user = await getCurrentUser();
  if (!user || user.id !== userId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  
  if (['admin', 'super_admin', 'owner', 'teacher'].includes(userRole)) {
    return true;
  }

  // Check if program is active
  const program = await db
    .select()
    .from(learningPrograms)
    .where(eq(learningPrograms.id, programId))
    .limit(1);

  return program.length > 0 && program[0].status === 'active';
}

/**
 * Check if user can access a specific path
 */
export async function canAccessPath(userId: string, pathId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  
  if (['admin', 'super_admin', 'owner', 'teacher'].includes(userRole)) {
    return true;
  }

  // Check if path is active
  const path = await db
    .select()
    .from(learningPaths)
    .where(eq(learningPaths.id, pathId))
    .limit(1);

  return path.length > 0 && (path[0].active ?? false);
}

/**
 * Check if user can modify their own progress
 */
export async function canModifyOwnProgress(userId: string, progressId: string): Promise<boolean> {
  const progress = await db
    .select()
    .from(userLearningProgress)
    .where(eq(userLearningProgress.id, progressId))
    .limit(1);

  if (!progress[0]) {
    return false;
  }

  return progress[0].userId === userId;
}

/**
 * Check if user can view another user's progress (admin/teacher only)
 */
export async function canViewOtherProgress(actorId: string, targetUserId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.id !== actorId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  
  // Admins and teachers can view other users' progress
  return ['admin', 'super_admin', 'owner', 'teacher'].includes(userRole);
}

/**
 * Check if user can manage learning paths (admin only)
 */
export async function canManageLearningPaths(userId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  
  return ['admin', 'super_admin', 'owner'].includes(userRole);
}

/**
 * Check if user can create content (modules, lessons)
 */
export async function canCreateContent(userId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  
  return ['admin', 'super_admin', 'owner', 'teacher'].includes(userRole);
}

/**
 * Check if user can delete content (admin only)
 */
export async function canDeleteContent(userId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.id !== userId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  
  return ['admin', 'super_admin', 'owner'].includes(userRole);
}
