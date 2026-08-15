import { error, fail, redirect } from '@sveltejs/kit';
import { getVirtualDb } from '$lib/apps/admin/introspect/registry';
import { getTableInfo } from '$lib/apps/admin/introspect/schema';
import { coerceValue, insertRow } from '$lib/apps/admin/introspect/crud';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const vdb = await getVirtualDb(params.app);
	if (!vdb) throw error(404, `No such app "${params.app}"`);

	const client = await vdb.getClient();
	const table = await getTableInfo(client, params.table);

	if (table.hasCompositeKey) {
		throw error(400, 'Cannot create rows in a table with a composite primary key.');
	}

	return { app: { slug: vdb.slug, title: vdb.title }, table };
};

export const actions: Actions = {
	default: async ({ params, request }) => {
		const vdb = await getVirtualDb(params.app);
		if (!vdb) throw error(404, `No such app "${params.app}"`);

		const client = await vdb.getClient();
		const table = await getTableInfo(client, params.table);

		const form = await request.formData();
		const values: Record<string, unknown> = {};

		for (const column of table.columns) {
			// Skip the auto-increment integer primary key when left blank -- let SQLite assign it.
			const raw = form.get(column.name);
			if (raw === null) continue;
			const rawStr = String(raw);
			if (column.isPrimaryKey && rawStr === '') continue;
			values[column.name] = coerceValue(column, rawStr);
		}

		try {
			await insertRow(client, table, values);
		} catch (e) {
			return fail(400, { error: e instanceof Error ? e.message : 'Failed to create row.' });
		}

		throw redirect(303, `/apps/admin/${params.app}/${params.table}`);
	}
};
