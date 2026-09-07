import { error } from '@sveltejs/kit';
import { getVirtualDb } from '$lib/apps/admin/introspect/registry';
import { listTables, countRows } from '$lib/apps/admin/introspect/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const vdb = await getVirtualDb(params.app);
	if (!vdb) throw error(404, `No such app "${params.app}"`);

	const client = await vdb.getClient();
	const tableNames = await listTables(client, vdb.slug);
	const tables = await Promise.all(
		tableNames.map(async (name) => ({ name, rowCount: await countRows(client, name) }))
	);

	return { app: { slug: vdb.slug, title: vdb.title }, tables };
};
