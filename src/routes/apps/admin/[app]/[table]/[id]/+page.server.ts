import { error, fail, redirect } from '@sveltejs/kit';
import { getVirtualDb } from '$lib/apps/admin/introspect/registry';
import { getTableInfo } from '$lib/apps/admin/introspect/schema';
import { coerceValue, getRow, updateRow } from '$lib/apps/admin/introspect/crud';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const vdb = await getVirtualDb(params.app);
	if (!vdb) throw error(404, `No such app "${params.app}"`);

	const client = await vdb.getClient();
	const table = await getTableInfo(client, params.table);

	if (table.hasCompositeKey) {
		throw error(400, 'Cannot edit rows in a table with a composite primary key.');
	}

	const row = await getRow(client, table, params.id);
	if (!row) throw error(404, 'Row not found.');

	return { app: { slug: vdb.slug, title: vdb.title }, table, row, pk: params.id };
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
			if (column.isPrimaryKey) continue; // PK is not editable
			const raw = form.get(column.name);
			if (raw === null) continue;
			values[column.name] = coerceValue(column, String(raw));
		}

		try {
			await updateRow(client, table, params.id, values);
		} catch (e) {
			return fail(400, { error: e instanceof Error ? e.message : 'Failed to update row.' });
		}

		throw redirect(303, `/apps/admin/${params.app}/${params.table}`);
	}
};
