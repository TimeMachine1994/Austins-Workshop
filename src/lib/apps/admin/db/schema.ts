import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: text('created_at')
		.notNull()
		.default('CURRENT_TIMESTAMP')
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(), // sha256 hash of the session token
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at').notNull() // unix seconds
});
