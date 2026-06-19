# Manual Actions Required - Architecture Remediation

## Architecture Remediation Manual Actions

The following manual actions are required to complete the architecture remediation implementation:

### 1. Environment Variables Configuration

Add the following environment variables to your `.env` file:

```env
# ─── Database ───────────────────────────────────────────────────────────────
# Neon PostgreSQL — single source of truth for all business data
DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require
DIRECT_URL=postgresql://user:password@ep-xxx.aws.neon.tech/dbname?sslmode=require

# ─── Supabase (Auth + Storage ONLY) ─────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ─── Application ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

# ─── Background Jobs ────────────────────────────────────────────────────────────
# Netlify Scheduled Functions handle all scheduled jobs automatically.
# CRON_SECRET is only used for notification-dispatch triggered by FastCron.
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
CRON_SECRET=generate-a-random-32-byte-hex-string

# ─── Security ────────────────────────────────────────────────────────────────
CSRF_SECRET=generate-a-random-32-byte-hex-string

# ─── Monitoring (GlitchTip — free forever, Sentry-compatible) ───────────────
# Sign up at glitchtip.com — no credit card required
# DSN format: https://<key>@app.glitchtip.com/<project-id>
GLITCHTIP_DSN=https://key@app.glitchtip.com/project-id

# ─── Analytics ───────────────────────────────────────────────────────────────
# Sign up at posthog.com — free plan available
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 2. GlitchTip Setup (Free Forever, Sentry-Compatible)

GlitchTip is a free, open-source alternative to Sentry that is 100% compatible with the Sentry SDK.

1. Create an account at https://glitchtip.com (email only, no credit card required)
2. Create a new project → select "Next.js" or "JavaScript"
3. Copy the DSN → set as `GLITCHTIP_DSN` in Netlify environment variables
4. GlitchTip is fully Sentry-API-compatible, no other changes needed

**Note:** The Sentry SDK (@sentry/nextjs) is already installed and configured. The only change needed is the DSN URL.

### 3. Netlify Scheduled Functions

Netlify Scheduled Functions handle all scheduled jobs automatically. No manual setup needed.
Schedules are defined in the function's config export.
Verify they are running in: Netlify Dashboard → Functions → Scheduled Functions

### 4. FastCron (for notification-dispatch only)

notification-dispatch is the only job triggered externally via FastCron because it may exceed 60 seconds under load.

1. Go to fastcron.com → Create free account (email only, no credit card)
2. Add new cron job:
   - URL: https://[your-netlify-domain]/api/cron/notification-dispatch
   - Method: POST
   - Header: x-cron-secret = [value of CRON_SECRET from Netlify env vars]
   - Schedule: every 15 minutes
3. Test manually once after setup to confirm it returns { success: true }

### 5. Netlify Environment Variables

Set the following environment variables in your Netlify dashboard:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `DIRECT_URL` - Neon PostgreSQL connection string
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `NEXT_PUBLIC_APP_URL` - Your Netlify site URL
- `NEXT_PUBLIC_SITE_URL` - Your Netlify site URL
- `CRON_SECRET` - Random 32-byte hex string for cron job validation
- `CSRF_SECRET` - Random 32-byte hex string for CSRF protection
- `GLITCHTIP_DSN` - GlitchTip DSN for monitoring
- `NEXT_PUBLIC_POSTHOG_KEY` - PostHog key for analytics
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host (https://app.posthog.com)

### 5. Database Migrations

All database migrations have been applied successfully. No manual action required.

### 6. Deployment Considerations

Before deploying to production:

1. Verify all environment variables are set in Netlify
2. Test GlitchTip integration is working
3. Verify cron jobs are working correctly
4. Test the aggregated dashboard endpoint
5. Verify CSRF protection is working
6. Test rate limiting functionality

### 7. Monitoring Setup

After deployment, monitor the following:

1. **GlitchTip Dashboard** - Track errors and performance
2. **Neon Dashboard** - Monitor database performance and query times
3. **Netlify Dashboard** - Monitor function execution and errors
4. **Application Logs** - Check for any errors in cron jobs or API endpoints

---

# Previous Manual Actions (Neon Database Migration)

## Database Connection Issue

**Status:** BLOCKED - Cannot connect to Neon PostgreSQL

**Problem:**
Both `drizzle-kit migrate` and `drizzle-kit push` commands are failing with connection errors:
- `drizzle-kit migrate`: CONNECT_TIMEOUT error
- `drizzle-kit push`: CONNECTION_CLOSED error

**Connection String Being Used:**
```
postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Possible Causes:**
1. Network/firewall restrictions preventing outbound connections to Neon
2. Neon project may be paused or suspended
3. Connection string format may need adjustment (try removing `channel_binding=require`)
4. Neon IP allowlisting may be required
5. SSL/TLS certificate issues

**Required Manual Actions:**

### Option 1: Test Connection Directly
Try connecting to Neon using psql or another PostgreSQL client to verify the connection string works:
```bash
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

### Option 2: Check Neon Console
1. Log into Neon Console (https://console.neon.tech)
2. Verify the project is active (not paused/suspended)
3. Check connection string in the Neon dashboard
4. Verify the database exists and is accessible
5. Check if IP allowlisting is enabled and if current IP needs to be added

### Option 3: Try Alternative Connection String
Try the connection string without `channel_binding=require`:
```
postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### Option 4: Check Network/Firewall
1. Verify outbound connections to port 5432 are allowed
2. Check if corporate firewall or VPN is blocking the connection
3. Try connecting from a different network if possible

## Migration Files Generated

The following migration files have been successfully generated and are ready to be applied once the connection issue is resolved:

1. `drizzle/0004_phase4_stories.sql` - Phase 4: Stories System
2. `drizzle/0005_phase5_srs.sql` - Phase 5: Spaced Repetition System
3. `drizzle/0006_phase6_xp_leveling.sql` - Phase 6: XP & Leveling System
4. `drizzle/0012_phase12_community.sql` - Phase 12: Community Platform

## Configuration Updates Completed

- `.env.example` created with Neon connection string template
- `.env.local` updated with Neon connection string
- Supabase Auth credentials preserved (Supabase remains for Auth + Storage only)

## Next Steps After Connection Resolved

Once the connection issue is resolved, run:
```bash
npm run db:push
```

This will push the complete schema (all 13 phases) to Neon in a single operation.

## Alternative Approach: Apply Migrations Manually

If drizzle-kit continues to fail, you can apply the SQL migration files manually using psql:

```bash
# Apply migrations in order
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0000_eager_tempest.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0001_phase3_vocabulary_system.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0004_phase4_stories.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0005_phase5_srs.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0002_phase7_streaks_achievements.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0002_phase8_daily_challenges.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0002_phase9_wallet_system.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0003_phase9_mission_system.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0006_phase6_xp_leveling.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0010_phase10_placement_test.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0002_phase11_learning_paths.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0012_phase12_community.sql
psql "postgresql://neondb_owner:npg_jbo8uBOS0prN@ep-broad-mouse-a2pfdyfc.eu-central-1.aws.neon.tech/neondb?sslmode=require" -f drizzle/0003_phase13_dialect_comparison.sql
```
