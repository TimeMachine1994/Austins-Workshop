import { redirect } from '@sveltejs/kit';
import { deleteSessionTokenCookie, invalidateSession } from '$lib/apps/screenwriter/auth/session';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (locals.screenwriter.session) {
		await invalidateSession(locals.screenwriter.session.id);
	}
	deleteSessionTokenCookie(cookies);
	throw redirect(303, '/apps/screenwriter');
};
