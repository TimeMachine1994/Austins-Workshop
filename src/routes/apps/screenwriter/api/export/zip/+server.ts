import { error } from '@sveltejs/kit';
import { zipSync, strToU8 } from 'fflate';
import { listOwnedDocuments } from '$lib/apps/screenwriter/server';
import type { RequestHandler } from './$types';

function sanitizeFilename(name: string): string {
	return name.replace(/[^a-z0-9-_ ]/gi, '').trim() || 'screenplay';
}

/** Downloads every screenplay owned by the signed-in account as a zip of JSON files. */
export const GET: RequestHandler = async ({ locals }) => {
	const user = locals.screenwriter.user;
	if (!user) throw error(401, 'Sign in to download a backup.');

	const docs = await listOwnedDocuments(user.id);

	const files: Record<string, Uint8Array> = {};
	for (const doc of docs) {
		// Short id suffix keeps same-titled scripts from colliding.
		const name = `${sanitizeFilename(doc.title)}-${doc.id.slice(0, 8)}.json`;
		files[name] = strToU8(JSON.stringify(doc, null, 2));
	}

	const zipped = zipSync(files);
	const date = new Date().toISOString().slice(0, 10);

	return new Response(new Uint8Array(zipped), {
		headers: {
			'content-type': 'application/zip',
			'content-disposition': `attachment; filename="screenplays-backup-${date}.zip"`
		}
	});
};
