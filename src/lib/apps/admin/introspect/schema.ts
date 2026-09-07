import type { Client } from '@libsql/client';

export type ColumnInfo = {
	name: string;
	/** Raw SQLite declared type (e.g. "INTEGER", "TEXT", "REAL"). May be empty string. */
	type: string;
	notNull: boolean;
	defaultValue: string | null;
	isPrimaryKey: boolean;
};

export type TableInfo = {
	name: string;
	columns: ColumnInfo[];
	/** Single-column primary key, or "rowid" fallback for tables with no declared PK. */
	primaryKeyColumn: string | null;
	/** True if the table has a composite (multi-column) primary key -- edit/delete are unsupported. */
	hasCompositeKey: boolean;
};

/** Tables SQLite/drizzle-kit create for bookkeeping -- never shown in the browser. */
const INTERNAL_TABLES = new Set(['__drizzle_migrations', 'sqlite_sequence']);

/**
 * A table belongs to an app if it is exactly the app's slug (e.g. `counter`)
 * or prefixed with "<slug>_" (e.g. `screenwriter_documents`). Every app's
 * tables are named that way because all apps share one database.
 */
function tableBelongsToApp(slug: string, name: string): boolean {
	return name === slug || name.startsWith(`${slug}_`);
}

export async function listTables(client: Client, appSlug?: string): Promise<string[]> {
	const result = await client.execute(
		"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'"
	);
	return result.rows
		.map((row) => String(row.name))
		.filter((name) => !INTERNAL_TABLES.has(name))
		.filter((name) => !name.endsWith('_drizzle_migrations'))
		.filter((name) => (appSlug ? tableBelongsToApp(appSlug, name) : true))
		.sort();
}

export async function getTableInfo(client: Client, table: string, appSlug?: string): Promise<TableInfo> {
	const tables = await listTables(client, appSlug);
	if (!tables.includes(table)) {
		throw new Error(`Unknown table "${table}"`);
	}

	// Table name is validated against the introspected allow-list above, so it's
	// safe to interpolate here (PRAGMA does not support bound parameters).
	const result = await client.execute(`PRAGMA table_info("${table}")`);

	const columns: ColumnInfo[] = result.rows.map((row) => ({
		name: String(row.name),
		type: String(row.type ?? ''),
		notNull: Number(row.notnull) === 1,
		defaultValue: row.dflt_value === null ? null : String(row.dflt_value),
		isPrimaryKey: Number(row.pk) === 1
	}));

	const pkColumns = columns.filter((c) => c.isPrimaryKey);

	return {
		name: table,
		columns,
		primaryKeyColumn: pkColumns.length === 1 ? pkColumns[0].name : pkColumns.length === 0 ? 'rowid' : null,
		hasCompositeKey: pkColumns.length > 1
	};
}

export async function countRows(client: Client, table: string): Promise<number> {
	// Table name must already be validated by the caller via getTableInfo/listTables.
	const result = await client.execute(`SELECT COUNT(*) as count FROM "${table}"`);
	return Number(result.rows[0]?.count ?? 0);
}
