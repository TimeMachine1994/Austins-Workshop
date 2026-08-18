import { json, error } from '@sveltejs/kit';
import {
	createDocument,
	withTitlePageDefault,
	type ScreenplayDocument
} from '$lib/apps/screenwriter/screenplay/types';
import { isValidDocument, checkDocumentLimits } from '$lib/apps/screenwriter/screenplay/validate';
import {
	insertDocument,
	listPublicDocuments,
	listUserDocuments
} from '$lib/apps/screenwriter/server';
import type { RequestHandler } from './$types';

/**
 * Scope is explicit (`?scope=mine|public`, default public) because signed-in
 * users can work in either area: the shared public sandbox or their own
 * private list. `mine` always requires a session.
 */
function resolveScope(url: URL, locals: App.Locals): 'public' | 'mine' {
	const scope = url.searchParams.get('scope') === 'mine' ? 'mine' : 'public';
	if (scope === 'mine' && !locals.screenwriter.user) {
		throw error(401, 'Sign in to access your scripts.');
	}
	return scope;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const scope = resolveScope(url, locals);
	const user = locals.screenwriter.user;
	return json(
		scope === 'mine' && user ? await listUserDocuments(user.id) : await listPublicDocuments()
	);
};

/**
 * Creates a document: a fresh one for `{}`, or an imported one when the body
 * is a full screenplay JSON. scope=public creates a shared sandbox doc;
 * scope=mine creates one owned by the signed-in account.
 */
export const POST: RequestHandler = async ({ request, url, locals }) => {
	const scope = resolveScope(url, locals);

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		throw error(400, 'Invalid JSON body.');
	}

	let doc: ScreenplayDocument;
	if (body && typeof body === 'object' && Object.keys(body).length > 0) {
		if (!isValidDocument(body)) throw error(400, 'Invalid screenplay document.');
		doc = withTitlePageDefault(body);
		const limitError = checkDocumentLimits(doc);
		if (limitError) throw error(413, limitError);
	} else {
		doc = createDocument();
	}

	const ownerId = scope === 'mine' ? (locals.screenwriter.user?.id ?? null) : null;
	const stored = await insertDocument(doc, ownerId);
	return json(stored, { status: 201 });
};
