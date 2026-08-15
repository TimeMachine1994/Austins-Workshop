/**
 * Template drizzle-kit config for a new app module.
 * Copy this file into src/lib/apps/<slug>/drizzle.config.ts and replace <slug>.
 *
 * See docs/adding-a-new-app.md for the full walkthrough.
 */
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/apps/<slug>/db/schema.ts',
	out: './src/lib/apps/<slug>/db/migrations',
	dbCredentials: {
		url: 'file:data/<slug>.db'
	}
});
