import type { Client } from '@libsql/client';
import type { ColumnInfo, TableInfo } from './schema';

const PAGE_SIZE = 25;
export { PAGE_SIZE };

export type ListRowsParams = {
	page: number;
	sort?: string;
	dir?: 'asc' | 'desc';
};

export type ListRowsResult = {
	rows: Record<string, unknown>[];
	total: number;
	page: number;
	pageCount: number;
};

/** The pseudo-column alias used to surface the implicit rowid for PK-less tables. */
const ROWID_ALIAS = '__rowid__';

function quoteIdent(name: string): string {
	return `"${name.replace(/"/g, '""')}"`;
}

function selectClause(table: TableInfo): string {
	return table.primaryKeyColumn === 'rowid'
		? `rowid AS ${ROWID_ALIAS}, *`
		: '*';
}

/** Extracts the primary-key value from a fetched row for this table. */
export function pkValueOf(table: TableInfo, row: Record<string, unknown>): unknown {
	if (table.primaryKeyColumn === 'rowid') return row[ROWID_ALIAS];
	return table.primaryKeyColumn ? row[table.primaryKeyColumn] : undefined;
}

function pkWhereClause(table: TableInfo): string {
	return table.primaryKeyColumn === 'rowid' ? 'rowid = ?' : `${quoteIdent(table.primaryKeyColumn!)} = ?`;
}

export async function listRows(
	client: Client,
	table: TableInfo,
	{ page, sort, dir = 'asc' }: ListRowsParams
): Promise<ListRowsResult> {
	const validSortColumns = new Set([
		...table.columns.map((c) => c.name),
		...(table.primaryKeyColumn === 'rowid' ? ['rowid'] : [])
	]);
	const sortColumn = sort && validSortColumns.has(sort) ? sort : (table.primaryKeyColumn ?? undefined);
	const sortDir = dir === 'desc' ? 'DESC' : 'ASC';

	const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${quoteIdent(table.name)}`);
	const total = Number(countResult.rows[0]?.count ?? 0);
	const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
	const safePage = Math.min(Math.max(1, page), pageCount);
	const offset = (safePage - 1) * PAGE_SIZE;

	const orderClause = sortColumn ? `ORDER BY ${quoteIdent(sortColumn)} ${sortDir}` : '';
	const result = await client.execute({
		sql: `SELECT ${selectClause(table)} FROM ${quoteIdent(table.name)} ${orderClause} LIMIT ? OFFSET ?`,
		args: [PAGE_SIZE, offset]
	});

	return {
		rows: result.rows.map((r) => ({ ...r })),
		total,
		page: safePage,
		pageCount
	};
}

export async function getRow(
	client: Client,
	table: TableInfo,
	pkValue: string
): Promise<Record<string, unknown> | undefined> {
	const result = await client.execute({
		sql: `SELECT ${selectClause(table)} FROM ${quoteIdent(table.name)} WHERE ${pkWhereClause(table)} LIMIT 1`,
		args: [pkValue]
	});
	return result.rows[0] ? { ...result.rows[0] } : undefined;
}

/** Coerces a raw form-string value into a JS value based on the column's declared SQLite type affinity. */
export function coerceValue(column: ColumnInfo, raw: string | null): unknown {
	if (raw === null || raw === '') {
		return column.notNull ? (raw ?? '') : null;
	}
	const type = column.type.toUpperCase();
	if (type.includes('INT')) {
		const n = Number.parseInt(raw, 10);
		return Number.isNaN(n) ? raw : n;
	}
	if (type.includes('REAL') || type.includes('FLOA') || type.includes('DOUB')) {
		const n = Number.parseFloat(raw);
		return Number.isNaN(n) ? raw : n;
	}
	return raw;
}

export async function insertRow(
	client: Client,
	table: TableInfo,
	values: Record<string, unknown>
): Promise<void> {
	const columns = Object.keys(values);
	if (columns.length === 0) return;

	await client.execute({
		sql: `INSERT INTO ${quoteIdent(table.name)} (${columns.map(quoteIdent).join(', ')}) VALUES (${columns
			.map(() => '?')
			.join(', ')})`,
		args: columns.map((c) => values[c] as never)
	});
}

export async function updateRow(
	client: Client,
	table: TableInfo,
	pkValue: string,
	values: Record<string, unknown>
): Promise<void> {
	const columns = Object.keys(values);
	if (columns.length === 0) return;

	await client.execute({
		sql: `UPDATE ${quoteIdent(table.name)} SET ${columns.map((c) => `${quoteIdent(c)} = ?`).join(', ')} WHERE ${pkWhereClause(table)}`,
		args: [...columns.map((c) => values[c] as never), pkValue]
	});
}

export async function deleteRow(client: Client, table: TableInfo, pkValue: string): Promise<void> {
	await client.execute({
		sql: `DELETE FROM ${quoteIdent(table.name)} WHERE ${pkWhereClause(table)}`,
		args: [pkValue]
	});
}
