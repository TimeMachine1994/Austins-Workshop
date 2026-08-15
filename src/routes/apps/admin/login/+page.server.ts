import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/apps/admin/db/client';
import { users } from '$lib/apps/admin/db/schema';
import { verifyPassword } from '$lib/apps/admin/auth/password';
import { createSession, setSessionTokenCookie } from '$lib/apps/admin/auth/session';
import { SESSION_DURATION_MS } from '$lib/apps/admin/auth/constants';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const username = String(form.get('username') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!username || !password) {
			return fail(400, { error: 'Username and password are required.' });
		}

		const rows = await db.select().from(users).where(eq(users.username, username)).limit(1);
		const user = rows[0];

		if (!user || !(await verifyPassword(password, user.passwordHash))) {
			return fail(400, { error: 'Invalid username or password.' });
		}

		const token = await createSession(user.id);
		setSessionTokenCookie(cookies, token, new Date(Date.now() + SESSION_DURATION_MS));

		throw redirect(303, '/apps/admin');
	}
};
