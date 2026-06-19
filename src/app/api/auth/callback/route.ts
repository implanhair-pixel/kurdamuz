import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Handles Supabase OAuth (Google) callback + email confirmation links.
// Always redirects locale-aware so non-English users never land on /en/...
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const locale = requestUrl.searchParams.get('locale') || 'fa';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // On failure, send back to login with an error flag rather than crashing.
      const loginUrl = new URL(`/${locale}/login`, requestUrl.origin);
      loginUrl.searchParams.set('error', 'oauth_failed');
      return NextResponse.redirect(loginUrl);
    }
  }

  // locale-aware redirect to dashboard
  return NextResponse.redirect(new URL(`/${locale}/dashboard`, requestUrl.origin));
}
