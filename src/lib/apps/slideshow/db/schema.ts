import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('slideshow_users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: text('created_at')
		.notNull()
		.default('CURRENT_TIMESTAMP')
});

export const sessions = sqliteTable('slideshow_sessions', {
	id: text('id').primaryKey(), // sha256 hash of the session token
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at').notNull() // unix seconds
});

export const slideshows = sqliteTable('slideshow_slideshows', {
	id: text('id').primaryKey(),
	ownerId: text('owner_id')
		.notNull()
		.references(() => users.id),
	/** URL-safe, user-chosen share slug (unique across the app). */
	slug: text('slug').notNull().unique(),
	title: text('title').notNull(),
	/** YouTube video URL for background music, or NULL for a silent slideshow. */
	musicUrl: text('music_url'),
	/** JSON-encoded settings: { slideDurationMs: number, transition: 'fade' | 'kenburns' }. */
	settings: text('settings').notNull(),
	createdAt: integer('created_at').notNull(), // unix ms
	updatedAt: integer('updated_at').notNull() // unix ms
});

export const photos = sqliteTable('slideshow_photos', {
	id: text('id').primaryKey(),
	slideshowId: text('slideshow_id')
		.notNull()
		.references(() => slideshows.id),
	/** Sort order within the slideshow (ascending). */
	position: integer('position').notNull(),
	/** Display name of a guest contributor; NULL = uploaded by the owner. */
	contributorName: text('contributor_name'),
	/** 'approved' | 'pending' | 'rejected' — guest uploads start pending. */
	status: text('status').notNull(),
	/** Paths relative to the uploads root (data/slideshow-uploads/). */
	originalPath: text('original_path').notNull(),
	thumbPath: text('thumb_path').notNull(),
	width: integer('width').notNull(),
	height: integer('height').notNull(),
	createdAt: integer('created_at').notNull() // unix ms
});
