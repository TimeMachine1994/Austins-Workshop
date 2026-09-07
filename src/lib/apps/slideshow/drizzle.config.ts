import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'turso',
	schema: './src/lib/apps/slideshow/db/schema.ts',
	out: './src/lib/apps/slideshow/db/migrations',
	// Shared database: each app tracks its own migrations in its own table.
	migrations: { table: 'slideshow_drizzle_migrations' },
	dbCredentials: {
		url: process.env.URL ?? 'file:data/workshop.db',
		authToken: process.env.TURSO_KEY
	}
});
