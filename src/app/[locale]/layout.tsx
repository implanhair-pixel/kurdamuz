import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import type { Locale } from '@/i18n/config';
import { DialectSwitcher } from '@/components/dialect/DialectSelectModal';

const rtlLocales = ['fa', 'ckb'];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;
  const dir = rtlLocales.includes(locale) ? 'rtl' : 'ltr';
  const lang = locale === 'ckb' ? 'ku' : locale === 'fa' ? 'fa' : 'en';

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <div lang={lang} dir={dir} className="min-h-screen" suppressHydrationWarning>
        {children}
        <DialectSwitcher />
      </div>
    </NextIntlClientProvider>
  );
}
