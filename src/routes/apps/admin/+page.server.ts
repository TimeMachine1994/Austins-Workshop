import { listVirtualDbs } from '$lib/apps/admin/introspect/registry';
import { listTables, countRows } from '$lib/apps/admin/introspect/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const virtualDbs = listVirtualDbs();

	const sections = await Promise.all(
		virtualDbs.map(async (vdb) => {
			const client = await vdb.getClient();
			const tableNames = await listTables(client);
			const tables = await Promise.all(
				tableNames.map(async (name) => ({ name, rowCount: await countRows(client, name) }))
			);
			return { slug: vdb.slug, title: vdb.title, description: vdb.description, tables };
		})
	);

	return { sections };
};
