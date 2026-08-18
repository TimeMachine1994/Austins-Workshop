import type {
	ScreenplayDocument,
	ScreenplayDocumentSummary
} from '$lib/apps/screenwriter/screenplay/types';

/**
 * Client-side storage adapter: same shape as the old IndexedDB module in the
 * standalone app, but backed by the server API. List/create take an explicit
 * scope ('public' sandbox vs. 'mine') because signed-in users can work in
 * both areas; the server enforces that 'mine' requires a session.
 */

const BASE = '/apps/screenwriter/api/documents';

async function handle<T>(res: Response): Promise<T> {
	if (!res.ok) {
		let message = `Request failed (${res.status})`;
		try {
			const body = await res.json();
			if (typeof body?.message === 'string') message = body.message;
		} catch {
			// keep the default message
		}
		throw new Error(message);
	}
	return res.json() as Promise<T>;
}

export type Scope = 'public' | 'mine';

export async function listDocuments(scope: Scope): Promise<ScreenplayDocumentSummary[]> {
	return handle(await fetch(`${BASE}?scope=${scope}`));
}

export async function getDocument(id: string): Promise<ScreenplayDocument> {
	return handle(await fetch(`${BASE}/${encodeURIComponent(id)}`));
}

/** Creates a document (a fresh one, or an imported one when `doc` is given). */
export async function createDocument(
	scope: Scope,
	doc?: ScreenplayDocument
): Promise<ScreenplayDocument> {
	return handle(
		await fetch(`${BASE}?scope=${scope}`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(doc ?? {})
		})
	);
}

export async function saveDocument(doc: ScreenplayDocument): Promise<ScreenplayDocument> {
	return handle(
		await fetch(`${BASE}/${encodeURIComponent(doc.id)}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(doc)
		})
	);
}

export async function deleteDocument(id: string): Promise<void> {
	const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
	if (!res.ok) throw new Error(`Delete failed (${res.status})`);
}

/** Lightweight freshness probe used by the editor's polling loop. */
export async function getDocumentUpdatedAt(id: string): Promise<number> {
	const data = await handle<{ updatedAt: number }>(
		await fetch(`${BASE}/${encodeURIComponent(id)}?meta=1`)
	);
	return data.updatedAt;
}
