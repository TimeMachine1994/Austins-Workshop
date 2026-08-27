import type { Handle, RequestEvent } from '@sveltejs/kit';
import * as adminAuth from '$lib/apps/admin/auth/session';
import { SESSION_COOKIE_NAME as ADMIN_SESSION_COOKIE } from '$lib/apps/admin/auth/constants';
import * as swAuth from '$lib/apps/screenwriter/auth/session';
import { SESSION_COOKIE_NAME as SW_SESSION_COOKIE } from '$lib/apps/screenwriter/auth/constants';
import * as ssAuth from '$lib/apps/slideshow/auth/session';
import { SESSION_COOKIE_NAME as SS_SESSION_COOKIE } from '$lib/apps/slideshow/auth/constants';
import { DEFAULT_THEME, THEME_COOKIE_NAME, isThemeId } from '$lib/themes/registry';

/**
 * Per-app auth: admin and screenwriter each validate their own session cookie
 * against their own database, only for requests under their own path prefix.
 * Every other route skips session lookups entirely.
 *
 * The theme cookie is read for every request so the server can inject
 * data-theme onto <html> (see src/app.html's %theme% placeholder) — this is
 * what makes SSR pages arrive already themed, with no flash of wrong theme.
 */

async function resolveAdminSession(event: RequestEvent): Promise<void> {
	const token = event.cookies.get(ADMIN_SESSION_COOKIE);
	if (!token) return;

	const { session, user } = await adminAuth.validateSessionToken(token);
	if (session && user) {
		event.locals.session = session;
		event.locals.user = user;
		adminAuth.setSessionTokenCookie(event.cookies, token, session.expiresAt);
	} else {
		adminAuth.deleteSessionTokenCookie(event.cookies);
	}
}

async function resolveScreenwriterSession(event: RequestEvent): Promise<void> {
	const token = event.cookies.get(SW_SESSION_COOKIE);
	if (!token) return;

	const { session, user } = await swAuth.validateSessionToken(token);
	if (session && user) {
		event.locals.screenwriter = { session, user };
		swAuth.setSessionTokenCookie(event.cookies, token, session.expiresAt);
	} else {
		swAuth.deleteSessionTokenCookie(event.cookies);
	}
}

async function resolveSlideshowSession(event: RequestEvent): Promise<void> {
	const token = event.cookies.get(SS_SESSION_COOKIE);
	if (!token) return;

	const { session, user } = await ssAuth.validateSessionToken(token);
	if (session && user) {
		event.locals.slideshow = { session, user };
		ssAuth.setSessionTokenCookie(event.cookies, token, session.expiresAt);
	} else {
		ssAuth.deleteSessionTokenCookie(event.cookies);
	}
}

export const handle: Handle = async ({ event, resolve }) => {
	const themeCookie = event.cookies.get(THEME_COOKIE_NAME);
	const theme = themeCookie && isThemeId(themeCookie) ? themeCookie : DEFAULT_THEME;
	event.locals.theme = theme;

	event.locals.user = null;
	event.locals.session = null;
	event.locals.screenwriter = { user: null, session: null };
	event.locals.slideshow = { user: null, session: null };

	if (event.url.pathname.startsWith('/apps/admin')) {
		await resolveAdminSession(event);
	} else if (event.url.pathname.startsWith('/apps/screenwriter')) {
		await resolveScreenwriterSession(event);
	} else if (event.url.pathname.startsWith('/apps/slideshow')) {
		await resolveSlideshowSession(event);
	}

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%theme%', theme)
	});
};
