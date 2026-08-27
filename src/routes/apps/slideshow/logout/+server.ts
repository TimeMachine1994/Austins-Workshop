import { redirect } from '@sveltejs/kit';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/apps/slideshow/auth/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (locals.slideshow.session) {
		await invalidateSession(locals.slideshow.session.id);
	}
	deleteSessionTokenCookie(cookies);
	throw redirect(303, '/apps/slideshow');
};
