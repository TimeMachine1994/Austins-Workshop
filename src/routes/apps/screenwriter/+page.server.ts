import { listPublicDocuments } from '$lib/apps/screenwriter/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { documents: await listPublicDocuments() };
};
