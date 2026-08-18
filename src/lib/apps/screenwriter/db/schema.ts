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

export const documents = sqliteTable('documents', {
	id: text('id').primaryKey(),
	/** NULL = public demo sandbox document, editable/deletable by anyone. */
	ownerId: text('owner_id').references(() => users.id),
	title: text('title').notNull(),
	/** JSON-encoded TitlePage. */
	titlePage: text('title_page').notNull(),
	/** JSON-encoded ScreenplayElement[]. */
	elements: text('elements').notNull(),
	createdAt: integer('created_at').notNull(), // unix ms
	updatedAt: integer('updated_at').notNull() // unix ms
});
