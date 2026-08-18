import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/apps/screenwriter/db/client';
import { users } from '$lib/apps/screenwriter/db/schema';
import { verifyPassword } from '$lib/apps/screenwriter/auth/password';
import { createSession, setSessionTokenCookie } from '$lib/apps/screenwriter/auth/session';
import { SESSION_DURATION_MS } from '$lib/apps/screenwriter/auth/constants';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.screenwriter.user) throw redirect(302, '/apps/screenwriter/my');
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const username = String(form.get('username') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!username || !password) {
			return fail(400, { username, error: 'Username and password are required.' });
		}

		const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
		const user = rows[0];

		if (!user || !(await verifyPassword(password, user.passwordHash))) {
			return fail(400, { username, error: 'Invalid username or password.' });
		}

		const token = await createSession(user.id);
		setSessionTokenCookie(cookies, token, new Date(Date.now() + SESSION_DURATION_MS));

		throw redirect(303, '/apps/screenwriter/my');
	}
};
