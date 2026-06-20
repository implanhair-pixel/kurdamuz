import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getEnvVar } from '@/lib/env-validation';

const locales = ['fa', 'ckb', 'en'] as const;
const defaultLocale = 'en';

// next-intl middleware handles locale routing + sets x-next-intl-locale header
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Routes that require authentication (path AFTER stripping locale)
const PROTECTED_PATHS = ['/dashboard', '/achievements', '/community', '/srs', '/leaderboard', '/stories'];
const ADMIN_PATHS = ['/admin'];
const OWNER_PATHS = ['/owner'];

// Public paths that logged-in users should NOT see
const AUTH_ONLY_PATHS = ['/login', '/signup'];

function stripLocale(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
    if (pathname === `/${locale}`) return '/';
  }
  return pathname;
}

function getLocaleFromPath(pathname: string): string {
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) return locale;
  }
  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals, API routes, and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Run intl middleware first to handle locale routing
  const intlResponse = intlMiddleware(request);

  // If intl middleware issued a redirect (e.g., / -> /fa), follow it
  if (intlResponse.status === 307 || intlResponse.status === 308) {
    return intlResponse;
  }

  const locale = getLocaleFromPath(pathname);
  const pathWithoutLocale = stripLocale(pathname);

  // Determine if route needs auth check
  const needsAuth =
    PROTECTED_PATHS.some((p) => pathWithoutLocale.startsWith(p)) ||
    ADMIN_PATHS.some((p) => pathWithoutLocale.startsWith(p)) ||
    OWNER_PATHS.some((p) => pathWithoutLocale.startsWith(p));

  const isAuthOnlyPath = AUTH_ONLY_PATHS.some((p) => pathWithoutLocale.startsWith(p));

  if (!needsAuth && !isAuthOnlyPath) {
    return intlResponse;
  }

  // Validate Supabase configuration
  const supabaseUrl = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  const PLACEHOLDER_PATTERNS = ['placeholder', 'your-project.supabase.co'];
  const isPlaceholderUrl = PLACEHOLDER_PATTERNS.some((p) => supabaseUrl?.includes(p));
  
  // In production, hard fail if Supabase credentials are missing or placeholders
  if (process.env.NODE_ENV === 'production') {
    if (!supabaseUrl || !supabaseAnonKey || isPlaceholderUrl) {
      throw new Error(
        'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set to real Supabase credentials in production. ' +
        'Current value: ' + (supabaseUrl || 'not set')
      );
    }
  } else {
    // In development, allow missing credentials with warning
    if (!supabaseUrl || !supabaseAnonKey || isPlaceholderUrl) {
      console.warn('⚠️  Supabase credentials missing or using placeholder in development - auth checks disabled');
      return intlResponse;
    }
  }

  // Check Supabase session
  let response = intlResponse;

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    // If user is logged in and tries to access login/signup, redirect to dashboard
    if (user && isAuthOnlyPath) {
      const dashUrl = new URL(`/${locale}/dashboard`, request.url);
      return NextResponse.redirect(dashUrl);
    }

    // If protected route and no user, redirect to login
    if (needsAuth && !user) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user) {
      const userRole = user.user_metadata?.role || 'student';

      // Admin route protection
      if (ADMIN_PATHS.some((p) => pathWithoutLocale.startsWith(p))) {
        if (!['admin', 'super_admin', 'owner'].includes(userRole)) {
          return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
        }
      }

      // Owner route protection
      if (OWNER_PATHS.some((p) => pathWithoutLocale.startsWith(p))) {
        if (!['owner', 'super_admin'].includes(userRole)) {
          return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
        }
      }
    }
  } catch (error) {
    // If Supabase check throws, handle based on environment
    if (process.env.NODE_ENV === 'production') {
      // In production, fail closed: redirect to login
      if (needsAuth) {
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set('next', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } else {
      // In development, allow access with warning
      console.warn('⚠️  Supabase auth check failed in development - allowing access');
      return intlResponse;
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
