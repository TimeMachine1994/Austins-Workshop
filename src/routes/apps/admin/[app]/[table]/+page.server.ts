import { error, fail } from '@sveltejs/kit';
import { getVirtualDb } from '$lib/apps/admin/introspect/registry';
import { getTableInfo } from '$lib/apps/admin/introspect/schema';
import { deleteRow, listRows, pkValueOf } from '$lib/apps/admin/introspect/crud';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	const vdb = await getVirtualDb(params.app);
	if (!vdb) throw error(404, `No such app "${params.app}"`);

	const client = await vdb.getClient();
	const table = await getTableInfo(client, params.table);

	const page = Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1;
	const sort = url.searchParams.get('sort') ?? undefined;
	const dir = url.searchParams.get('dir') === 'desc' ? 'desc' : 'asc';

	const result = await listRows(client, table, { page, sort, dir });

	return {
		app: { slug: vdb.slug, title: vdb.title },
		table,
		rows: result.rows.map((row) => ({ pk: String(pkValueOf(table, row) ?? ''), data: row })),
		total: result.total,
		page: result.page,
		pageCount: result.pageCount,
		sort,
		dir
	};
};

export const actions: Actions = {
	delete: async ({ params, request }) => {
		const vdb = await getVirtualDb(params.app);
		if (!vdb) throw error(404, `No such app "${params.app}"`);

		const client = await vdb.getClient();
		const table = await getTableInfo(client, params.table);

		if (table.hasCompositeKey) {
			return fail(400, { error: 'Cannot delete rows from a table with a composite primary key.' });
		}

		const form = await request.formData();
		const pk = String(form.get('pk') ?? '');
		if (!pk) return fail(400, { error: 'Missing row identifier.' });

		await deleteRow(client, table, pk);
		return { success: true };
	}
};
