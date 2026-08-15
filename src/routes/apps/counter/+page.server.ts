import { db } from '$lib/apps/counter/db/client';
import { counter } from '$lib/apps/counter/db/schema';
import { sql } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

async function getOrCreateRow() {
	const rows = await db.select().from(counter).limit(1);
	if (rows.length > 0) return rows[0];

	const [inserted] = await db
		.insert(counter)
		.values({ value: 0 })
		.returning();
	return inserted;
}

export const load: PageServerLoad = async () => {
	const row = await getOrCreateRow();
	return { value: row.value };
};

export const actions: Actions = {
	increment: async () => {
		const row = await getOrCreateRow();
		await db
			.update(counter)
			.set({ value: row.value + 1, updatedAt: sql`CURRENT_TIMESTAMP` })
			.where(sql`${counter.id} = ${row.id}`);
	},
	reset: async () => {
		const row = await getOrCreateRow();
		await db
			.update(counter)
			.set({ value: 0, updatedAt: sql`CURRENT_TIMESTAMP` })
			.where(sql`${counter.id} = ${row.id}`);
	}
};
