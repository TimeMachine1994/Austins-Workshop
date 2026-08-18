import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/apps/screenwriter/db/schema.ts',
	out: './src/lib/apps/screenwriter/db/migrations',
	dbCredentials: {
		url: 'file:data/screenwriter.db'
	}
});
