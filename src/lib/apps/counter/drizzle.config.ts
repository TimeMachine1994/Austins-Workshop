import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/apps/counter/db/schema.ts',
	out: './src/lib/apps/counter/db/migrations',
	dbCredentials: {
		url: 'file:data/counter.db'
	}
});
