export const locales = ['fa', 'ckb', 'en'] as const;
export const defaultLocale = 'fa' as const;
export type Locale = (typeof locales)[number];
