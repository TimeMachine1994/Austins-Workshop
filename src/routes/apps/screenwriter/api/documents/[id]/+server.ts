import { json, error } from '@sveltejs/kit';
import { withTitlePageDefault } from '$lib/apps/screenwriter/screenplay/types';
import { isValidDocument, checkDocumentLimits } from '$lib/apps/screenwriter/screenplay/validate';
import {
	deleteDocumentRow,
	getAccessibleRow,
	rowToDocument,
	updateDocument
} from '$lib/apps/screenwriter/server';
import type { RequestHandler } from './$types';

/**
 * Single-document endpoints. All of them 404 when the document doesn't exist
 * OR the caller isn't allowed to touch it (private doc, different/no account)
 * so private documents' existence is never leaked.
 */

/** Fetch one document; `?meta=1` returns just { updatedAt } for the polling loop. */
export const GET: RequestHandler = async ({ params, url, locals }) => {
	const row = await getAccessibleRow(params.id, locals);
	if (!row) throw error(404, 'Not found.');

	if (url.searchParams.get('meta')) {
		return json({ updatedAt: row.updatedAt });
	}
	return json(rowToDocument(row));
};

/** Full-document save (autosave). Last write wins. */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const row = await getAccessibleRow(params.id, locals);
	if (!row) throw error(404, 'Not found.');

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body.');
	}
	if (!isValidDocument(body)) throw error(400, 'Invalid screenplay document.');

	const doc = withTitlePageDefault(body);
	const limitError = checkDocumentLimits(doc);
	if (limitError) throw error(413, limitError);

	return json(await updateDocument(params.id, doc));
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const row = await getAccessibleRow(params.id, locals);
	if (!row) throw error(404, 'Not found.');

	await deleteDocumentRow(params.id);
	return json({ ok: true });
};
