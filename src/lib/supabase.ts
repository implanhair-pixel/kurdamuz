import { createClient } from '@supabase/supabase-js';

const isNextProductionBuild = process.env.NEXT_PHASE === 'phase-production-build';

function requireSupabaseEnv(value: string | undefined, name: string): string {
  if (value) return value;

  if (isNextProductionBuild) {
    return name === 'NEXT_PUBLIC_SUPABASE_URL'
      ? 'https://placeholder.supabase.co'
      : 'placeholder-build-key';
  }

  throw new Error(
    `${name} is not set. ` +
      'Please copy .env.example to .env and fill in your Supabase credentials.'
  );
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(
  requireSupabaseEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
  requireSupabaseEnv(supabaseAnonKey, 'NEXT_PUBLIC_SUPABASE_ANON_KEY')
);

export const supabaseAdmin = createClient(
  requireSupabaseEnv(supabaseUrl, 'NEXT_PUBLIC_SUPABASE_URL'),
  supabaseServiceRoleKey ?? (isNextProductionBuild ? 'placeholder-service-role-key' : ''),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
