import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { localePath, normalizeLocale } from '@/lib/locale';

export const dynamic = 'force-dynamic';

function getRequestLocale() {
  return normalizeLocale(headers().get('x-next-intl-locale'), 'en');
}

export default async function AdminCoursesPage() {
  const locale = getRequestLocale();
  redirect(localePath(locale, '/admin/courses'));
}
