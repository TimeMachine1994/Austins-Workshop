import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const counter = sqliteTable('counter', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	value: integer('value').notNull().default(0),
	updatedAt: text('updated_at')
		.notNull()
		.default('CURRENT_TIMESTAMP')
});
