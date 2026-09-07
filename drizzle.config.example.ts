/**
 * Template drizzle-kit config for a new app module.
 * Copy this file into src/lib/apps/<slug>/drizzle.config.ts and replace <slug>.
 *
 * All apps share one database, so prefix every table name in schema.ts with
 * "<slug>_" and keep the per-app migrations table below.
 *
 * See docs/app-lifecycle.md for the full walkthrough.
 */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'turso',
	schema: './src/lib/apps/<slug>/db/schema.ts',
	out: './src/lib/apps/<slug>/db/migrations',
	migrations: { table: '<slug>_drizzle_migrations' },
	dbCredentials: {
		url: process.env.URL ?? 'file:data/workshop.db',
		authToken: process.env.TURSO_KEY
	}
});
