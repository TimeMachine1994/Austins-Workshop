export type ElementType =
	| 'scene_heading'
	| 'action'
	| 'character'
	| 'dialogue'
	| 'parenthetical'
	| 'transition';

export interface ScreenplayElement {
	id: string;
	type: ElementType;
	text: string;
}

export interface TitlePage {
	title: string;
	author: string;
	/** Free-text block: name / address / phone / email, one per line. */
	contact: string;
}

export interface ScreenplayDocument {
	id: string;
	title: string;
	titlePage: TitlePage;
	elements: ScreenplayElement[];
	createdAt: number;
	updatedAt: number;
}

/** Listing shape returned by the list API (no elements payload). */
export interface ScreenplayDocumentSummary {
	id: string;
	title: string;
	createdAt: number;
	updatedAt: number;
}

export function createElement(type: ElementType, text = ''): ScreenplayElement {
	return { id: crypto.randomUUID(), type, text };
}

export function createTitlePage(title = ''): TitlePage {
	return { title, author: '', contact: '' };
}

/** Ensures older/imported documents without a titlePage get a sensible default. */
export function withTitlePageDefault(doc: ScreenplayDocument): ScreenplayDocument {
	if (doc.titlePage) return doc;
	return { ...doc, titlePage: createTitlePage(doc.title) };
}

export function createDocument(title = 'Untitled Screenplay'): ScreenplayDocument {
	const now = Date.now();
	return {
		id: crypto.randomUUID(),
		title,
		titlePage: createTitlePage(title),
		elements: [createElement('scene_heading', '')],
		createdAt: now,
		updatedAt: now
	};
}
