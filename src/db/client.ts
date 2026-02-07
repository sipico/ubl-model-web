import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';

/**
 * Creates a database client based on environment.
 *
 * - Production/Staging: Uses Bunny Database via libSQL HTTP
 * - Local dev: Uses local SQLite file
 * - Tests: Uses in-memory SQLite (configured in test setup)
 */
export function createDb(url?: string, authToken?: string) {
  const dbUrl = url || process.env.DATABASE_URL || 'file:local.db';

  const client = createClient({
    url: dbUrl,
    authToken: authToken || process.env.DATABASE_AUTH_TOKEN,
  });

  return drizzle(client, { schema });
}

// Default export for production use
export const db = createDb();

export type Database = ReturnType<typeof createDb>;
