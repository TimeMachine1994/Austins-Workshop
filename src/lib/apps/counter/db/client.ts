import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/**
 * Each app owns its own libSQL connection + database file.
 *
 * Local dev: points at a file under data/<slug>.db.
 * Turso later: set env vars below instead of the file: url, no code changes needed.
 *   url: process.env.COUNTER_DATABASE_URL,
 *   authToken: process.env.COUNTER_AUTH_TOKEN
 */
const client = createClient({
	url: process.env.COUNTER_DATABASE_URL ?? 'file:data/counter.db',
	authToken: process.env.COUNTER_AUTH_TOKEN
});

export const db = drizzle(client, { schema });
