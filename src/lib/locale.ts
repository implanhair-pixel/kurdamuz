export function normalizeLocale(locale: string | null | undefined, fallback = 'en'): string {
  return locale && locale.trim() ? locale : fallback;
}

export function localePath(locale: string, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/${normalizeLocale(locale)}${normalizedPath}`;
}
