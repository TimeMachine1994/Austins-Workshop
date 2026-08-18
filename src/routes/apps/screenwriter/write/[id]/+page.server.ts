import { error } from '@sveltejs/kit';
import { getAccessibleRow, rowToDocument } from '$lib/apps/screenwriter/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const row = await getAccessibleRow(params.id, locals);
	// 404 for both "doesn't exist" and "not yours" so private docs never leak.
	if (!row) throw error(404, 'Script not found.');

	return {
		doc: rowToDocument(row),
		isPublic: row.ownerId === null
	};
};
