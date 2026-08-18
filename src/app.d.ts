// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { ThemeId } from '$lib/themes/registry';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Populated by hooks.server.ts for requests under /apps/admin. */
			user: { id: string; username: string } | null;
			session: { id: string; expiresAt: Date } | null;
			/** Populated by hooks.server.ts for requests under /apps/screenwriter. */
			screenwriter: {
				user: { id: string; username: string } | null;
				session: { id: string; expiresAt: Date } | null;
			};
			/** Active theme resolved from the theme cookie (defaults to 'system'). */
			theme: ThemeId;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
