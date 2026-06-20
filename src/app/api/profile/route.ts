import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/db';
import { profiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { isDialect } from '@/types/content';

/**
 * Current user's profile (role, selected dialect, XP/coins/streak).
 *
 * This is the API that src/components/dialect/DialectSelectModal.tsx
 * (DialectSelectModal + DialectSwitcher) calls to read/persist the
 * user's selected dialect. Per the project architecture, Supabase/Neon
 * is the only place dialect selection is stored — never localStorage.
 */

export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (existing) {
      return NextResponse.json({ profile: existing });
    }

    // The signup trigger (drizzle/0021_phase_profiles.sql) should create
    // this row automatically, but in case it hasn't run yet (e.g. local
    // dev against a DB the migration wasn't applied to, or a race right
    // after signup), create it here rather than 404-ing the dialect modal.
    const userMeta = (user as { user_metadata?: { full_name?: string; avatar_url?: string; role?: string } }).user_metadata;
    const [created] = await db
      .insert(profiles)
      .values({
        id: user.id,
        fullName: userMeta?.full_name ?? null,
        avatarUrl: userMeta?.avatar_url ?? null,
        role: (userMeta?.role as typeof profiles.$inferInsert.role) ?? 'student',
      })
      .onConflictDoNothing()
      .returning();

    if (created) {
      return NextResponse.json({ profile: created });
    }

    // onConflictDoNothing + no row returned means a concurrent insert won
    // the race — re-fetch.
    const [refetched] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    return NextResponse.json({ profile: refetched ?? null });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  let user;
  try {
    user = await requireAuth();
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { selectedDialect?: unknown; fullName?: unknown; avatarUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const update: Partial<typeof profiles.$inferInsert> = {
    updatedAt: new Date(),
  };

  if (body.selectedDialect !== undefined) {
    if (typeof body.selectedDialect !== 'string' || !isDialect(body.selectedDialect)) {
      return NextResponse.json(
        { error: 'selectedDialect must be one of: sorani, kurmanji, bahdini, kalhory, leki, hawrami, jafi' },
        { status: 400 },
      );
    }
    update.selectedDialect = body.selectedDialect;
  }

  if (body.fullName !== undefined) {
    if (body.fullName !== null && typeof body.fullName !== 'string') {
      return NextResponse.json({ error: 'fullName must be a string or null' }, { status: 400 });
    }
    update.fullName = body.fullName;
  }

  if (body.avatarUrl !== undefined) {
    if (body.avatarUrl !== null && typeof body.avatarUrl !== 'string') {
      return NextResponse.json({ error: 'avatarUrl must be a string or null' }, { status: 400 });
    }
    update.avatarUrl = body.avatarUrl;
  }

  try {
    // Ensure a row exists first (see GET for why), then apply the update.
    await db
      .insert(profiles)
      .values({ id: user.id })
      .onConflictDoNothing();

    const [updated] = await db
      .update(profiles)
      .set(update)
      .where(eq(profiles.id, user.id))
      .returning();

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
