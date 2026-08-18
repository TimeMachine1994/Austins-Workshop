import { redirect } from '@sveltejs/kit';
import { listUserDocuments } from '$lib/apps/screenwriter/server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.screenwriter.user;
	if (!user) {
		throw redirect(302, '/apps/screenwriter/login');
	}
	return { documents: await listUserDocuments(user.id) };
};
