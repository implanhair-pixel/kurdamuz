---
name: KURDAMUZ Dev Auth
description: How authentication bypasses work when Supabase credentials are placeholder values
---

## The rule
When `NEXT_PUBLIC_SUPABASE_URL` is absent, equals `https://placeholder.supabase.co`, or contains the string "placeholder":

1. **`getCurrentUser()` in `src/lib/auth.ts`** — returns a hard-coded `DEV_MOCK_USER` object with `role: 'admin'` and `full_name: 'Hosen Ahmed'`. This allows all server components / pages to render without a real Supabase session.

2. **Middleware in `src/middleware.ts`** — skips all Supabase session checks and returns the intl response directly. Without this, protected routes redirect to /login before the page can even call `getCurrentUser()`.

**Why:** Replit dev environment ships with placeholder Supabase creds. Without this pattern every protected page (dashboard, admin, leaderboard, etc.) would redirect to login, making UI development impossible.

**How to apply:** Any new protected page that calls `getCurrentUser()` or `requireAuth()` will automatically get the mock user. The middleware's bypass is already in place for all PROTECTED_PATHS, ADMIN_PATHS, and OWNER_PATHS.
