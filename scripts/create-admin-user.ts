/**
 * One-time CLI seed script to create an admin dashboard user.
 *
 * Usage: npm run admin:create-user
 *
 * NOTE: this reads username/password from stdin as plain visible text (no
 * masking) -- it's a local-only bootstrap tool, not exposed over the network.
 * Run it in a private terminal.
 */
import { randomUUID } from 'node:crypto';
import { createInterface } from 'node:readline/promises';
import { eq } from 'drizzle-orm';
import { db } from '../src/lib/apps/admin/db/client';
import { users } from '../src/lib/apps/admin/db/schema';
import { hashPassword } from '../src/lib/apps/admin/auth/password';

async function main() {
	const rl = createInterface({ input: process.stdin, output: process.stdout });

	const username = (await rl.question('Username: ')).trim();
	const password = await rl.question('Password: ');
	rl.close();

	if (!username || !password) {
		console.error('Username and password are both required.');
		process.exit(1);
	}

	const existing = await db.select().from(users).where(eq(users.username, username)).limit(1);
	if (existing.length > 0) {
		console.error(`User "${username}" already exists.`);
		process.exit(1);
	}

	const passwordHash = await hashPassword(password);

	await db.insert(users).values({
		id: randomUUID(),
		username,
		passwordHash
	});

	console.log(`Created admin user "${username}".`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
