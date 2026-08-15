/**
 * Central registry of installed mini-apps.
 *
 * To add a new app:
 *   1. Build its module under src/lib/apps/<slug>/ (db/schema.ts, db/client.ts, drizzle.config.ts)
 *   2. Add its routes under src/routes/apps/<slug>/
 *   3. Add one entry below.
 *
 * See docs/adding-a-new-app.md for the full step-by-step guide.
 */
export type AppEntry = {
	slug: string;
	title: string;
	description: string;
	/** Emoji or short label used as a lightweight icon on the homepage grid. */
	icon: string;
	/** Excluded from the homepage grid and top nav, but still a normal registered app. */
	hidden?: boolean;
};

export const apps: AppEntry[] = [
	{
		slug: 'counter',
		title: 'Counter',
		description: 'Minimal example app demonstrating the per-app Drizzle + libSQL pattern.',
		icon: '🔢'
	},
	{
		slug: 'admin',
		title: 'Admin',
		description: 'Command center: browse and manage every app\u2019s data.',
		icon: '\ud83d\udee0\ufe0f',
		hidden: true
	}
];
