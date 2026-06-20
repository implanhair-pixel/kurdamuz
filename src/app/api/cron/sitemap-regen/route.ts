import { NextResponse } from 'next/server';
import { validateCronSecret } from '@/lib/cron-validation';
import { db } from '@/db';
import { stories, courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import * as Sentry from '@sentry/nextjs';

/**
 * Sitemap regeneration cron route.
 *
 * Previous implementation used `fs/promises writeFile` to write
 * `public/sitemap.xml` on disk. That approach does not work on serverless
 * platforms (Netlify, Vercel) where the filesystem is read-only at runtime.
 *
 * This version returns the sitemap XML directly as an HTTP response so that
 * Netlify can cache it at the edge, or a cron caller can push it to an
 * external storage bucket (S3, Supabase Storage, etc.) if needed.
 *
 * If you need a static file at /sitemap.xml, the recommended approach for
 * Next.js 13+ is to create `src/app/sitemap.ts` which Next.js generates
 * automatically at build time. This cron route is kept for cases where
 * on-demand regeneration of sitemap data is required.
 */

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const startTime = Date.now();

  try {
    await validateCronSecret();

    Sentry.captureMessage('Sitemap regeneration started', 'info');

    const [publishedStories, publishedCourses] = await Promise.all([
      db
        .select({ slug: stories.slug, updatedAt: stories.updatedAt })
        .from(stories)
        .where(eq(stories.status, 'published')),
      db
        .select({ id: courses.id, updatedAt: courses.updatedAt })
        .from(courses)
        .where(eq(courses.status, 'published')),
    ]);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kurdamuz.com';

    const staticPaths = [
      '/',
      '/community',
      '/courses',
      '/grammar',
      '/vocabulary',
      '/stories',
      '/dashboard',
      '/srs',
      '/leaderboard',
      '/achievements',
    ];

    const urls = [
      ...staticPaths.map((pathName) => ({ loc: pathName, lastmod: new Date() })),
      ...publishedStories.map((story) => ({
        loc: `/stories/${story.slug}`,
        lastmod: story.updatedAt ?? new Date(),
      })),
      ...publishedCourses.map((course) => ({
        loc: `/courses/${course.id}`,
        lastmod: course.updatedAt ?? new Date(),
      })),
    ];

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls
        .map(
          (entry) =>
            `\n  <url>\n    <loc>${escapeXml(`${siteUrl}${entry.loc}`)}</loc>\n    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>\n  </url>`
        )
        .join('') +
      `\n</urlset>\n`;

    const duration = Date.now() - startTime;

    Sentry.captureMessage(
      `Sitemap regenerated with ${urls.length} URLs in ${duration}ms`,
      'info'
    );

    // Return XML directly — callers can cache or push to storage as needed.
    // On serverless platforms the filesystem is read-only so writing to disk
    // is not supported; use next.js app/sitemap.ts for static generation.
    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Duration-Ms': String(duration),
        'X-Url-Count': String(urls.length),
      },
    });
  } catch (error) {
    console.error('Sitemap regeneration error:', error);
    Sentry.captureException(error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to regenerate sitemap' },
      { status: 500 }
    );
  }
}
