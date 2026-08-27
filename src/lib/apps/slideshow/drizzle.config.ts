import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/apps/slideshow/db/schema.ts',
	out: './src/lib/apps/slideshow/db/migrations',
	dbCredentials: {
		url: 'file:data/slideshow.db'
	}
});
