import { eq, isNull, desc } from 'drizzle-orm';
import { db } from './db/client';
import { documents } from './db/schema';
import {
	withTitlePageDefault,
	createTitlePage,
	type ScreenplayDocument,
	type ScreenplayDocumentSummary
} from './screenplay/types';

/**
 * Server-side document store + access rules. Server-only module
 * (imported exclusively from +page.server.ts / +server.ts files).
 *
 * Access rule:
 *   ownerId === null  -> public sandbox doc: anyone may read/update/delete
 *   ownerId !== null  -> only the owning account's sessions may touch it
 */

type DocumentRow = typeof documents.$inferSelect;

export function canAccess(row: DocumentRow, locals: App.Locals): boolean {
	return row.ownerId === null || row.ownerId === locals.screenwriter.user?.id;
}

export function rowToDocument(row: DocumentRow): ScreenplayDocument {
	return withTitlePageDefault({
		id: row.id,
		title: row.title,
		titlePage: JSON.parse(row.titlePage),
		elements: JSON.parse(row.elements),
		createdAt: row.createdAt,
		updatedAt: row.updatedAt
	});
}

/** Fetches a document row if it exists AND the request may access it; null otherwise. */
export async function getAccessibleRow(
	id: string,
	locals: App.Locals
): Promise<DocumentRow | null> {
	const rows = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
	const row = rows[0];
	if (!row || !canAccess(row, locals)) return null;
	return row;
}

const summaryColumns = {
	id: documents.id,
	title: documents.title,
	createdAt: documents.createdAt,
	updatedAt: documents.updatedAt
};

/** Lists the public demo sandbox documents (ownerId IS NULL), newest-edited first. */
export async function listPublicDocuments(): Promise<ScreenplayDocumentSummary[]> {
	return db
		.select(summaryColumns)
		.from(documents)
		.where(isNull(documents.ownerId))
		.orderBy(desc(documents.updatedAt));
}

/** Lists a signed-in user's own documents, newest-edited first. */
export async function listUserDocuments(userId: string): Promise<ScreenplayDocumentSummary[]> {
	return db
		.select(summaryColumns)
		.from(documents)
		.where(eq(documents.ownerId, userId))
		.orderBy(desc(documents.updatedAt));
}

/** Lists full documents owned by a user (for the ZIP export). */
export async function listOwnedDocuments(userId: string): Promise<ScreenplayDocument[]> {
	const rows = await db
		.select()
		.from(documents)
		.where(eq(documents.ownerId, userId))
		.orderBy(desc(documents.updatedAt));
	return rows.map(rowToDocument);
}

/** Inserts a document. Any incoming id is replaced server-side to avoid collisions. */
export async function insertDocument(
	doc: ScreenplayDocument,
	ownerId: string | null
): Promise<ScreenplayDocument> {
	const now = Date.now();
	const stored: ScreenplayDocument = {
		...doc,
		id: crypto.randomUUID(),
		titlePage: doc.titlePage ?? createTitlePage(doc.title),
		createdAt: now,
		updatedAt: now
	};
	await db.insert(documents).values({
		id: stored.id,
		ownerId,
		title: stored.title,
		titlePage: JSON.stringify(stored.titlePage),
		elements: JSON.stringify(stored.elements),
		createdAt: stored.createdAt,
		updatedAt: stored.updatedAt
	});
	return stored;
}

/** Full-document update (autosave). Last write wins. */
export async function updateDocument(
	id: string,
	doc: ScreenplayDocument
): Promise<ScreenplayDocument> {
	const now = Date.now();
	await db
		.update(documents)
		.set({
			title: doc.title,
			titlePage: JSON.stringify(doc.titlePage),
			elements: JSON.stringify(doc.elements),
			updatedAt: now
		})
		.where(eq(documents.id, id));
	return { ...doc, id, updatedAt: now };
}

export async function deleteDocumentRow(id: string): Promise<void> {
	await db.delete(documents).where(eq(documents.id, id));
}
