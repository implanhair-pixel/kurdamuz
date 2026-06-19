import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const locales = ['fa', 'ckb', 'en'] as const;
const defaultLocale = 'fa';

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

  // Skip auth checks entirely when Supabase is not configured (dev mode only).
  // SECURITY: this bypass must never trigger in production — otherwise a
  // misconfigured prod deploy (missing/placeholder Supabase env vars) would
  // let every visitor through to /admin and /owner with no auth check at all.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder =
    process.env.NODE_ENV !== 'production' &&
    (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('placeholder'));
  if (isPlaceholder) {
    return intlResponse;
  }

  // Check Supabase session
  let response = intlResponse;

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
  } catch {
    // If Supabase check throws (e.g. placeholder creds in dev), allow access
    // without auth check — but ONLY outside production. In production a
    // thrown error here must NOT silently open up protected routes.
    if (needsAuth && process.env.NODE_ENV !== 'production') {
      if (
        process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co' ||
        !process.env.NEXT_PUBLIC_SUPABASE_URL
      ) {
        return intlResponse;
      }
    }
    // In production, fail closed: redirect to login instead of letting the
    // request through with no verified session.
    if (needsAuth && process.env.NODE_ENV === 'production') {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
