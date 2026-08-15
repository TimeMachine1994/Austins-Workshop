// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Populated by hooks.server.ts for requests under /apps/admin. */
			user: { id: string; username: string } | null;
			session: { id: string; expiresAt: Date } | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
