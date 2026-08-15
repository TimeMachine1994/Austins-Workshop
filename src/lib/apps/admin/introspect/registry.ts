import type { Client } from '@libsql/client';
import { apps } from '$lib/apps/registry';

/**
 * Lazily-imported client modules for every mini-app, keyed by their file path
 * (e.g. "/src/lib/apps/counter/db/client.ts"). Vite resolves this glob at build
 * time, so new apps under src/lib/apps/<slug>/db/client.ts are picked up
 * automatically -- no changes needed here when a new app is registered.
 */
const clientModules = import.meta.glob<{ db: { $client: Client } }>('/src/lib/apps/*/db/client.ts');

export type VirtualDb = {
	slug: string;
	title: string;
	description: string;
	getClient: () => Promise<Client>;
};

/**
 * Every registered app except `admin` itself, exposed as a "virtual database"
 * with a lazy getter for its raw libSQL client (bypassing the drizzle wrapper
 * and any per-app schema, so this stays fully generic).
 */
export function listVirtualDbs(): VirtualDb[] {
	return apps
		.filter((app) => app.slug !== 'admin')
		.map((app) => {
			const path = `/src/lib/apps/${app.slug}/db/client.ts`;
			const importModule = clientModules[path];

			return {
				slug: app.slug,
				title: app.title,
				description: app.description,
				getClient: async () => {
					if (!importModule) {
						throw new Error(`No db client module found for app "${app.slug}" at ${path}`);
					}
					const mod = await importModule();
					return mod.db.$client;
				}
			};
		});
}

export async function getVirtualDb(slug: string): Promise<VirtualDb | undefined> {
	return listVirtualDbs().find((vdb) => vdb.slug === slug);
}
