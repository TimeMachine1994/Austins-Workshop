import { randomUUID } from 'node:crypto';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/apps/slideshow/db/client';
import { users } from '$lib/apps/slideshow/db/schema';
import { hashPassword } from '$lib/apps/slideshow/auth/password';
import { createSession, setSessionTokenCookie } from '$lib/apps/slideshow/auth/session';
import { SESSION_DURATION_MS } from '$lib/apps/slideshow/auth/constants';
import type { Actions, PageServerLoad } from './$types';

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,32}$/;
const MIN_PASSWORD_LENGTH = 8;

export const load: PageServerLoad = ({ locals }) => {
	if (locals.slideshow.user) throw redirect(302, '/apps/slideshow');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const username = String(form.get('username') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const confirm = String(form.get('confirm') ?? '');

		if (!USERNAME_RE.test(username)) {
			return fail(400, {
				username,
				error: 'Username must be 3-32 characters: letters, numbers, hyphens, underscores.'
			});
		}
		if (password.length < MIN_PASSWORD_LENGTH) {
			return fail(400, { username, error: 'Password must be at least 8 characters.' });
		}
		if (password !== confirm) {
			return fail(400, { username, error: 'Passwords do not match.' });
		}

		const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
		if (existing.length > 0) {
			return fail(400, { username, error: 'That username is already taken.' });
		}

		const userId = randomUUID();
		await db.insert(users).values({
			id: userId,
			username,
			passwordHash: await hashPassword(password)
		});

		const token = await createSession(userId);
		setSessionTokenCookie(cookies, token, new Date(Date.now() + SESSION_DURATION_MS));

		throw redirect(303, '/apps/slideshow');
	}
};
