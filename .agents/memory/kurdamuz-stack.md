---
name: KURDAMUZ Stack & Constraints
description: Key stack versions and constraints for the KURDAMUZ platform
---

## Stack
- Next.js **14.2.30** (NOT 15.x — Replit security policy blocks it)
- next-intl **3.26.3** — locales: fa, ckb, en; defaultLocale: fa; localePrefix: 'always'
- Tailwind CSS v3
- Supabase SSR (`@supabase/ssr`)
- Drizzle ORM + Postgres
- Lucide React icons

## Critical: next-intl middleware pattern
Must use `createMiddleware` from `'next-intl/middleware'` as the base. This sets the `x-next-intl-locale` header that `getRequestConfig` in `src/i18n/request.ts` relies on. Without it, `requestLocale` is undefined and `notFound()` is called for every locale route.

Custom auth logic should be layered on top AFTER calling the intl middleware.

## next.config.js
- `allowedDevOrigins`: must include `*.replit.dev`, `*.janeway.replit.dev`, `*.worf.replit.dev`  
- `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` — needed for dev

## i18n request.ts
```ts
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale; // Promise in v3.22+
  if (!locale || !locales.includes(locale as Locale)) notFound();
  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };
});
```

**Why:** Any deviation from the `createMiddleware` pattern causes 404s on all locale routes, which is very hard to debug.
