import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const PLACEHOLDER_PATTERNS = [
  'placeholder',
  'helium',
  'ep-xxx',
  'localhost:5432/kurdamuz_dev',
  'user:password@',
];

function isPlaceholderUrl(url: string): boolean {
  return PLACEHOLDER_PATTERNS.some((p) => url.includes(p));
}

function getConnectionString(): string | null {
  const url = process.env.DATABASE_URL;
  if (!url || isPlaceholderUrl(url)) return null;
  return url;
}

const connectionString = getConnectionString();

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

if (connectionString) {
  client = postgres(connectionString, {
    prepare: false,
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  dbInstance = drizzle(client, { schema });
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    if (!dbInstance) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(
          'DATABASE_URL must be set to a valid Neon PostgreSQL URL in production. ' +
          'Current value: ' + (process.env.DATABASE_URL || 'not set')
        );
      }
      const stub = () => Promise.resolve([]);
      const stubQuery = new Proxy(stub, {
        get: () => stubQuery,
        apply: () => Promise.resolve([]),
      });
      if (prop === 'select' || prop === 'insert' || prop === 'update' || prop === 'delete') {
        return () => stubQuery;
      }
      return stubQuery;
    }
    const value = (dbInstance as any)[prop];
    if (typeof value === 'function') return value.bind(dbInstance);
    return value;
  },
});

export { schema };
