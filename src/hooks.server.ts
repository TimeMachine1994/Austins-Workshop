import type { Handle } from '@sveltejs/kit';
import {
	deleteSessionTokenCookie,
	setSessionTokenCookie,
	validateSessionToken
} from '$lib/apps/admin/auth/session';
import { SESSION_COOKIE_NAME } from '$lib/apps/admin/auth/constants';

/**
 * Only the admin app has auth. For every other route, locals.user/session stay null
 * and no session lookup happens.
 */
export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.session = null;

	if (!event.url.pathname.startsWith('/apps/admin')) {
		return resolve(event);
	}

	const token = event.cookies.get(SESSION_COOKIE_NAME);
	if (!token) {
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(token);
	if (session && user) {
		event.locals.session = session;
		event.locals.user = user;
		setSessionTokenCookie(event.cookies, token, session.expiresAt);
	} else {
		deleteSessionTokenCookie(event.cookies);
	}

	return resolve(event);
};
