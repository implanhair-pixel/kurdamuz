-- Centralized profiles table for auth-linked gamification state.
-- Supabase/Neon holds ONLY: auth, XP, coins, streak, SRS progress,
-- selected_dialect, role. No learning content lives here.

CREATE TABLE IF NOT EXISTS "profiles" (
  "id" uuid PRIMARY KEY,
  "full_name" text,
  "avatar_url" text,
  "role" text NOT NULL DEFAULT 'student',
  "selected_dialect" text,
  "xp" integer NOT NULL DEFAULT 0,
  "coins" integer NOT NULL DEFAULT 0,
  "streak_days" integer NOT NULL DEFAULT 0,
  "last_active" timestamp DEFAULT now(),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Constrain role and selected_dialect to known values at the DB level too,
-- not just in application code / Drizzle's TS types.
ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_role_check"
  CHECK ("role" IN ('student', 'teacher', 'admin_super', 'owner'));

ALTER TABLE "profiles"
  ADD CONSTRAINT "profiles_selected_dialect_check"
  CHECK (
    "selected_dialect" IS NULL OR "selected_dialect" IN (
      'sorani', 'kurmanji', 'bahdini', 'kalhory', 'leki', 'hawrami', 'jafi'
    )
  );

CREATE INDEX IF NOT EXISTS "profiles_role_idx" ON "profiles" ("role");

-- Auto-create a profile row whenever a new Supabase auth user is created,
-- so every authenticated user has exactly one profiles row from signup.
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;

CREATE TRIGGER on_auth_user_created_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();

-- Backfill: create a profile row for any existing auth user who doesn't
-- have one yet (relevant if this migration runs against an existing DB).
INSERT INTO public.profiles (id, full_name, avatar_url, role)
SELECT
  u.id,
  u.raw_user_meta_data->>'full_name',
  u.raw_user_meta_data->>'avatar_url',
  COALESCE(u.raw_user_meta_data->>'role', 'student')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
