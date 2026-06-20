import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { localePath, normalizeLocale } from '@/lib/locale';

/**
 * Root /admin/learning-paths redirect.
 *
 * The actual Learning Paths management UI lives at /[locale]/admin/learning-paths.
 * This file previously duplicated that entire page — kept in sync was error-prone.
 * It now does what /admin/courses does: read the user's active locale from the
 * next-intl middleware header and forward immediately.
 */
export const dynamic = 'force-dynamic';

async function getRequestLocale(): Promise<string> {
  const headersList = await headers();
  return normalizeLocale(headersList.get('x-next-intl-locale'), 'en');
}

export default async function AdminLearningPathsRootPage() {
  const locale = await getRequestLocale();
  redirect(localePath(locale, '/admin/learning-paths'));
}
