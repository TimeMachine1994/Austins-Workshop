import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/apps/admin/db/schema.ts',
	out: './src/lib/apps/admin/db/migrations',
	dbCredentials: {
		url: 'file:data/admin.db'
	}
});
