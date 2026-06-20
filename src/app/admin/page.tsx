import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { localePath, normalizeLocale } from '@/lib/locale';

/**
 * Root /admin redirect — forwards to the locale-aware admin dashboard.
 *
 * Uses the x-next-intl-locale header (set by the next-intl middleware) to
 * preserve the user's active locale. Falls back to 'en' if the header is
 * absent (e.g. direct server-side navigation without middleware context).
 *
 * Previous implementation hard-coded `defaultLocale` which sent every user
 * to /fa/admin regardless of their active language.
 */
export const dynamic = 'force-dynamic';

export default async function AdminRootPage() {
  const headersList = await headers();
  const locale = normalizeLocale(headersList.get('x-next-intl-locale'), 'en');
  redirect(localePath(locale, '/admin'));
}
