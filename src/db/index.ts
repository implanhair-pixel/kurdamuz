import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { validateEnvOnStartup, getEnvVar } from '@/lib/env-validation';

// Validate environment on module import
validateEnvOnStartup();

const PLACEHOLDER_PATTERNS = [
  'placeholder',
  'helium',
  'ep-xxx',
  'localhost:5432/kurdamuz_dev',
  'user:password@',
  'your-project.supabase.co',
];

function isPlaceholderUrl(url: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => url.includes(p));
}

function getConnectionString(): string {
  const url = getEnvVar('DATABASE_URL');
  
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'DATABASE_URL environment variable is not set. ' +
        'Please configure a valid Neon PostgreSQL connection string.'
      );
    }
    // In development, use a fallback placeholder
    console.warn('⚠️  DATABASE_URL not set - using placeholder for development');
    return 'postgresql://placeholder:placeholder@localhost:5432/kurdamuz_dev';
  }
  
  if (isPlaceholderUrl(url)) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'DATABASE_URL appears to be a placeholder value. ' +
        'Please configure a real Neon PostgreSQL connection string. ' +
        'Current value: ' + url
      );
    }
    console.warn('⚠️  DATABASE_URL is a placeholder - development mode');
  }
  
  return url;
}

const connectionString = getConnectionString();

const client = postgres(connectionString, {
  prepare: false,
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

export { schema };
