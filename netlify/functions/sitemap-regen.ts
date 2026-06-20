import type { Config } from '@netlify/functions';
import * as Sentry from '@sentry/nextjs';
import { db } from '@/db';
import { stories, courses } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { writeFile } from 'fs/promises';
import path from 'path';

export const config: Config = {
  schedule: '0 1 * * *',
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler() {
  const startTime = Date.now();

  try {
    Sentry.captureMessage('Sitemap regeneration started', 'info');
    console.log('Sitemap regeneration started');

    const [publishedStories, publishedCourses] = await Promise.all([
      db.select({ slug: stories.slug, updatedAt: stories.updatedAt }).from(stories).where(eq(stories.status, 'published')),
      db.select({ id: courses.id, updatedAt: courses.updatedAt }).from(courses).where(eq(courses.status, 'published')),
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
      ...publishedStories.map((story) => ({ loc: `/stories/${story.slug}`, lastmod: story.updatedAt ?? new Date() })),
      ...publishedCourses.map((course) => ({ loc: `/courses/${course.id}`, lastmod: course.updatedAt ?? new Date() })),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      urls.map((entry) => `
  <url>
    <loc>${escapeXml(`${siteUrl}${entry.loc}`)}</loc>
    <lastmod>${new Date(entry.lastmod).toISOString()}</lastmod>
  </url>`).join('') +
      `
</urlset>
`;

    await writeFile(path.join(process.cwd(), 'public', 'sitemap.xml'), xml, 'utf8');

    const duration = Date.now() - startTime;
    console.log(`Sitemap regenerated. ${urls.length} URLs in ${duration}ms`);
    Sentry.captureMessage(`Sitemap regenerated with ${urls.length} URLs in ${duration}ms`, 'info');

    return {
      success: true,
      urlCount: urls.length,
      duration,
    };
  } catch (error) {
    console.error('Sitemap regeneration error:', error);
    Sentry.captureException(error);
    throw error;
  }
}
