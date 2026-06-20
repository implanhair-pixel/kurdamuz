import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// ============================================================================
// DEV MOCK USER — SECURITY CRITICAL
// ============================================================================
// This mock user exists ONLY so the app can render locally without real
// Supabase credentials configured. It must NEVER be reachable in production,
// even if NEXT_PUBLIC_SUPABASE_URL is accidentally left blank or set to a
// placeholder value in a prod deploy. The previous version only checked the
// Supabase URL, so a misconfigured production deploy would silently grant
// every visitor admin access. We now hard-require NODE_ENV !== 'production'
// and an explicit ALLOW_DEV_MOCK_USER opt-in flag.
const DEV_MOCK_USER = {
  id: 'dev-mock-user-id',
  email: 'admin@kurdamuz.dev',
  user_metadata: {
    full_name: 'Dev User',
    role: 'admin',
    avatar_url: null,
  },
  app_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as any;

function isDevMockAllowed() {
  return process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_MOCK_USER === 'true';
}

function isPlaceholderSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url === 'https://placeholder.supabase.co' || url.includes('placeholder');
}

export async function getCurrentUser() {
  if (isPlaceholderSupabase()) {
    if (!isDevMockAllowed()) {
      throw new Error(
        'Supabase is not configured and DEV_MOCK_USER is disabled. Set ALLOW_DEV_MOCK_USER=true for local development only.'
      );
    }
    return DEV_MOCK_USER;
  }
  try {
    const supabase = await getSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireRole(role: 'owner' | 'super_admin' | 'admin' | 'editor' | 'teacher' | 'student') {
  const user = await requireAuth();
  
  // Check user role from user metadata or a custom table
  // For now, we'll use user metadata
  const userRole = user.user_metadata?.role;
  
  if (userRole !== role) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}

/**
 * Require minimum role level (hierarchical)
 */
export async function requireMinRole(minRole: 'owner' | 'super_admin' | 'admin' | 'editor' | 'teacher' | 'student') {
  const user = await requireAuth();
  const userRole = user.user_metadata?.role || 'student';
  
  const roleHierarchy = {
    owner: 6,
    super_admin: 5,
    admin: 4,
    editor: 3,
    teacher: 2,
    student: 1,
  };
  
  if (roleHierarchy[userRole as keyof typeof roleHierarchy] < roleHierarchy[minRole]) {
    throw new Error('Forbidden: Insufficient permissions');
  }

  return user;
}

// ============================================================================
// VOCABULARY SYSTEM RBAC
// ============================================================================

export type VocabularyPermission = 
  | 'read:vocabulary'
  | 'create:vocabulary'
  | 'update:vocabulary'
  | 'delete:vocabulary'
  | 'read:user_vocabulary'
  | 'create:user_vocabulary'
  | 'update:user_vocabulary'
  | 'delete:user_vocabulary'
  | 'read:notebooks'
  | 'create:notebooks'
  | 'update:notebooks'
  | 'delete:notebooks'
  | 'read:review'
  | 'create:review'
  | 'admin:vocabulary';

const ROLE_PERMISSIONS: Record<string, VocabularyPermission[]> = {
  admin: [
    'read:vocabulary',
    'create:vocabulary',
    'update:vocabulary',
    'delete:vocabulary',
    'read:user_vocabulary',
    'create:user_vocabulary',
    'update:user_vocabulary',
    'delete:user_vocabulary',
    'read:notebooks',
    'create:notebooks',
    'update:notebooks',
    'delete:notebooks',
    'read:review',
    'create:review',
    'admin:vocabulary',
  ],
  student: [
    'read:vocabulary',
    'read:user_vocabulary',
    'create:user_vocabulary',
    'update:user_vocabulary',
    'delete:user_vocabulary',
    'read:notebooks',
    'create:notebooks',
    'update:notebooks',
    'delete:notebooks',
    'read:review',
    'create:review',
  ],
};

export async function requirePermission(permission: VocabularyPermission) {
  const user = await requireAuth();
  const userRole = user.user_metadata?.role || 'student';
  
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.student;
  
  if (!permissions.includes(permission)) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }

  return user;
}

export function hasPermission(userRole: string, permission: VocabularyPermission): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.student;
  return permissions.includes(permission);
}

// ============================================================================
// COMMUNITY RBAC
// ============================================================================

export type CommunityPermission =
  | 'read:posts'
  | 'create:posts'
  | 'update:posts'
  | 'update:own_posts'
  | 'delete:posts'
  | 'read:comments'
  | 'create:comments'
  | 'update:comments'
  | 'update:own_comments'
  | 'delete:comments'
  | 'react:content'
  | 'report:content'
  | 'read:profiles'
  | 'update:own_profile'
  | 'moderate:content'
  | 'moderate:users'
  | 'admin:community'
  | 'view:analytics'
  | 'manage:notifications';

const COMMUNITY_ROLE_PERMISSIONS: Record<string, CommunityPermission[]> = {
  owner: [
    'read:posts', 'create:posts', 'update:posts', 'delete:posts',
    'read:comments', 'create:comments', 'update:comments', 'delete:comments',
    'react:content', 'report:content',
    'read:profiles', 'update:own_profile',
    'moderate:content', 'moderate:users',
    'admin:community', 'view:analytics', 'manage:notifications',
  ],
  super_admin: [
    'read:posts', 'create:posts', 'update:posts', 'delete:posts',
    'read:comments', 'create:comments', 'update:comments', 'delete:comments',
    'react:content', 'report:content',
    'read:profiles', 'update:own_profile',
    'moderate:content', 'moderate:users',
    'admin:community', 'view:analytics', 'manage:notifications',
  ],
  admin: [
    'read:posts', 'create:posts', 'update:posts', 'delete:posts',
    'read:comments', 'create:comments', 'update:comments', 'delete:comments',
    'react:content', 'report:content',
    'read:profiles', 'update:own_profile',
    'moderate:content', 'moderate:users',
    'view:analytics', 'manage:notifications',
  ],
  editor: [
    'read:posts', 'create:posts', 'update:posts',
    'read:comments', 'create:comments', 'update:comments',
    'react:content', 'report:content',
    'read:profiles', 'update:own_profile',
  ],
  teacher: [
    'read:posts', 'create:posts', 'update:posts',
    'read:comments', 'create:comments', 'update:comments',
    'react:content', 'report:content',
    'read:profiles', 'update:own_profile',
  ],
  student: [
    'read:posts', 'create:posts', 'update:own_posts',
    'read:comments', 'create:comments', 'update:own_comments',
    'react:content', 'report:content',
    'read:profiles', 'update:own_profile',
  ],
};

export async function requireCommunityPermission(permission: CommunityPermission) {
  const user = await requireAuth();
  const userRole = user.user_metadata?.role || 'student';
  
  const permissions = COMMUNITY_ROLE_PERMISSIONS[userRole] || COMMUNITY_ROLE_PERMISSIONS.student;
  
  if (!permissions.includes(permission)) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }

  return user;
}

export function hasCommunityPermission(userRole: string, permission: CommunityPermission): boolean {
  const permissions = COMMUNITY_ROLE_PERMISSIONS[userRole] || COMMUNITY_ROLE_PERMISSIONS.student;
  return permissions.includes(permission);
}

// ============================================================================
// RESOURCE OWNERSHIP CHECKS
// ============================================================================

export async function requireOwnership(resourceType: 'notebook' | 'user_vocabulary' | 'post' | 'comment' | 'profile', resourceId: string) {
  const user = await requireAuth();
  const supabase = await getSupabaseServerClient();

  let isOwner = false;

  if (resourceType === 'notebook') {
    const { data } = await supabase
      .from('vocabulary_notebooks')
      .select('user_id')
      .eq('id', resourceId)
      .single();
    
    isOwner = data?.user_id === user.id;
  } else if (resourceType === 'user_vocabulary') {
    const { data } = await supabase
      .from('user_vocabulary')
      .select('user_id')
      .eq('id', resourceId)
      .single();
    
    isOwner = data?.user_id === user.id;
  } else if (resourceType === 'post') {
    const { data } = await supabase
      .from('community_posts')
      .select('user_id')
      .eq('id', resourceId)
      .single();
    
    isOwner = data?.user_id === user.id;
  } else if (resourceType === 'comment') {
    const { data } = await supabase
      .from('community_comments')
      .select('user_id')
      .eq('id', resourceId)
      .single();
    
    isOwner = data?.user_id === user.id;
  } else if (resourceType === 'profile') {
    const { data } = await supabase
      .from('community_profiles')
      .select('user_id')
      .eq('id', resourceId)
      .single();
    
    isOwner = data?.user_id === user.id;
  }

  if (!isOwner) {
    throw new Error('Forbidden: You do not own this resource');
  }

  return user;
}

// ============================================================================
// RATE LIMITING
// ============================================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function getRateLimitHeaders(identifier: string, maxRequests: number, windowMs: number) {
  const record = rateLimitMap.get(identifier);
  const now = Date.now();
  
  if (!record || now > record.resetTime) {
    return {
      'X-RateLimit-Limit': maxRequests.toString(),
      'X-RateLimit-Remaining': (maxRequests - 1).toString(),
      'X-RateLimit-Reset': (now + windowMs).toString(),
    };
  }

  return {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': Math.max(0, maxRequests - record.count).toString(),
    'X-RateLimit-Reset': record.resetTime.toString(),
  };
}

// ============================================================================
// XP SYSTEM RBAC
// ============================================================================

export type XPPermission =
  | 'read:own_xp'
  | 'read:own_level'
  | 'read:own_transactions'
  | 'read:own_rewards'
  | 'claim:own_rewards'
  | 'read:own_achievements'
  | 'read:leaderboard'
  | 'read:own_analytics'
  | 'award:xp'
  | 'remove:xp'
  | 'correct:xp'
  | 'manage:rewards'
  | 'manage:achievements'
  | 'manage:level_definitions'
  | 'read:all_xp'
  | 'read:all_analytics'
  | 'admin:xp';

const XP_ROLE_PERMISSIONS: Record<string, XPPermission[]> = {
  owner: [
    'read:own_xp', 'read:own_level', 'read:own_transactions',
    'read:own_rewards', 'claim:own_rewards', 'read:own_achievements',
    'read:leaderboard', 'read:own_analytics',
    'award:xp', 'remove:xp', 'correct:xp',
    'manage:rewards', 'manage:achievements', 'manage:level_definitions',
    'read:all_xp', 'read:all_analytics', 'admin:xp',
  ],
  super_admin: [
    'read:own_xp', 'read:own_level', 'read:own_transactions',
    'read:own_rewards', 'claim:own_rewards', 'read:own_achievements',
    'read:leaderboard', 'read:own_analytics',
    'award:xp', 'remove:xp', 'correct:xp',
    'manage:rewards', 'manage:achievements', 'manage:level_definitions',
    'read:all_xp', 'read:all_analytics', 'admin:xp',
  ],
  admin: [
    'read:own_xp', 'read:own_level', 'read:own_transactions',
    'read:own_rewards', 'claim:own_rewards', 'read:own_achievements',
    'read:leaderboard', 'read:own_analytics',
    'award:xp', 'remove:xp', 'correct:xp',
    'manage:rewards', 'manage:achievements',
    'read:all_xp', 'read:all_analytics',
  ],
  teacher: [
    'read:own_xp', 'read:own_level', 'read:own_transactions',
    'read:own_rewards', 'claim:own_rewards', 'read:own_achievements',
    'read:leaderboard', 'read:own_analytics',
    'award:xp',
  ],
  student: [
    'read:own_xp', 'read:own_level', 'read:own_transactions',
    'read:own_rewards', 'claim:own_rewards', 'read:own_achievements',
    'read:leaderboard', 'read:own_analytics',
  ],
};

export async function requireXPPermission(permission: XPPermission) {
  const user = await requireAuth();
  const userRole = user.user_metadata?.role || 'student';
  
  const permissions = XP_ROLE_PERMISSIONS[userRole] || XP_ROLE_PERMISSIONS.student;
  
  if (!permissions.includes(permission)) {
    throw new Error(`Forbidden: Missing permission ${permission}`);
  }

  return user;
}

export function hasXPPermission(userRole: string, permission: XPPermission): boolean {
  const permissions = XP_ROLE_PERMISSIONS[userRole] || XP_ROLE_PERMISSIONS.student;
  return permissions.includes(permission);
}

/**
 * Check if user can award XP to another user
 */
export async function canAwardXP(actorId: string, targetUserId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.id !== actorId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  
  // Teachers can award XP to students
  if (userRole === 'teacher') {
    return true;
  }

  // Admins and above can award XP to anyone
  if (['admin', 'super_admin', 'owner'].includes(userRole)) {
    return true;
  }

  return false;
}

/**
 * Check if user can modify another user's XP (admin only)
 */
export async function canModifyXP(actorId: string, targetUserId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.id !== actorId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  
  // Only admins and above can remove/correct XP
  return ['admin', 'super_admin', 'owner'].includes(userRole);
}

/**
 * Check if user can manage rewards (admin only)
 */
export async function canManageRewards(actorId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.id !== actorId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  
  // Only admins and above can manage rewards
  return ['admin', 'super_admin', 'owner'].includes(userRole);
}

/**
 * Check if user can manage achievements (admin only)
 */
export async function canManageAchievements(actorId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user || user.id !== actorId) {
    return false;
  }

  const userRole = user.user_metadata?.role || 'student';
  
  // Only admins and above can manage achievements
  return ['admin', 'super_admin', 'owner'].includes(userRole);
}
