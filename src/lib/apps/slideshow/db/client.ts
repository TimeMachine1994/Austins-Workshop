import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

/**
 * All apps share one libSQL database. Each app's tables are prefixed with
 * its slug (e.g. "slideshow_...") so they never collide with another app's.
 *
 * Local dev: points at a single file under data/workshop.db.
 * Turso: set URL / TURSO_KEY, no code changes needed.
 */
const client = createClient({
	url: process.env.URL ?? 'file:data/workshop.db',
	authToken: process.env.TURSO_KEY
});

export const db = drizzle(client, { schema });
