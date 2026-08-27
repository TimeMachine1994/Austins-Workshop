import { randomBytes, createHash } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { sessions, users } from '../db/schema';
import { SESSION_COOKIE_NAME, SESSION_DURATION_MS, SESSION_RENEWAL_THRESHOLD_MS } from './constants';

export type SessionValidationResult =
	| { session: { id: string; expiresAt: Date }; user: { id: string; username: string } }
	| { session: null; user: null };

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

/** Generates a new opaque session token (the raw value stored in the cookie). */
export function generateSessionToken(): string {
	return randomBytes(20).toString('hex');
}

/** Creates a session for a user and returns the raw token to store in a cookie. */
export async function createSession(userId: string): Promise<string> {
	const token = generateSessionToken();
	const id = hashToken(token);
	const expiresAt = Date.now() + SESSION_DURATION_MS;

	await db.insert(sessions).values({ id, userId, expiresAt: Math.floor(expiresAt / 1000) });

	return token;
}

/** Validates a raw session token, sliding the expiry forward if it's nearing expiration. */
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const id = hashToken(token);

	const rows = await db
		.select({
			sessionId: sessions.id,
			expiresAt: sessions.expiresAt,
			userId: users.id,
			username: users.username
		})
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, id))
		.limit(1);

	if (rows.length === 0) return { session: null, user: null };

	const row = rows[0];
	const expiresAtMs = row.expiresAt * 1000;

	if (Date.now() >= expiresAtMs) {
		await db.delete(sessions).where(eq(sessions.id, id));
		return { session: null, user: null };
	}

	if (expiresAtMs - Date.now() < SESSION_RENEWAL_THRESHOLD_MS) {
		const newExpiresAt = Date.now() + SESSION_DURATION_MS;
		await db
			.update(sessions)
			.set({ expiresAt: Math.floor(newExpiresAt / 1000) })
			.where(eq(sessions.id, id));
		return {
			session: { id: row.sessionId, expiresAt: new Date(newExpiresAt) },
			user: { id: row.userId, username: row.username }
		};
	}

	return {
		session: { id: row.sessionId, expiresAt: new Date(expiresAtMs) },
		user: { id: row.userId, username: row.username }
	};
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export function setSessionTokenCookie(cookies: Cookies, token: string, expiresAt: Date): void {
	cookies.set(SESSION_COOKIE_NAME, token, {
		path: '/apps/slideshow',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		expires: expiresAt
	});
}

export function deleteSessionTokenCookie(cookies: Cookies): void {
	cookies.set(SESSION_COOKIE_NAME, '', {
		path: '/apps/slideshow',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: 0
	});
}
