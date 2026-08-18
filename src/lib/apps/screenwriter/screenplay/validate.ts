import type { ElementType, ScreenplayDocument, ScreenplayElement } from './types';

const VALID_TYPES: ElementType[] = [
	'scene_heading',
	'action',
	'character',
	'dialogue',
	'parenthetical',
	'transition'
];

/** Server-enforced limits — keeps the open public sandbox from being abused. */
export const MAX_TITLE_LENGTH = 200;
export const MAX_TITLE_PAGE_FIELD_LENGTH = 1000;
export const MAX_ELEMENTS = 5000;
export const MAX_ELEMENT_TEXT_LENGTH = 10_000;
export const MAX_DOCUMENT_BYTES = 200 * 1024; // 200KB serialized

function isValidElement(el: unknown): el is ScreenplayElement {
	if (typeof el !== 'object' || el === null) return false;
	const e = el as Record<string, unknown>;
	return (
		typeof e.id === 'string' &&
		typeof e.text === 'string' &&
		typeof e.type === 'string' &&
		VALID_TYPES.includes(e.type as ElementType)
	);
}

export function isValidDocument(data: unknown): data is ScreenplayDocument {
	if (typeof data !== 'object' || data === null) return false;
	const d = data as Record<string, unknown>;
	// titlePage is intentionally not required here for backward compatibility
	// with JSON exported before the title page feature existed; a default is
	// applied via withTitlePageDefault() after parsing.
	return (
		typeof d.id === 'string' &&
		typeof d.title === 'string' &&
		Array.isArray(d.elements) &&
		d.elements.every(isValidElement) &&
		typeof d.createdAt === 'number' &&
		typeof d.updatedAt === 'number'
	);
}

/**
 * Size-limit check applied on the server for every create/save.
 * Returns an error message, or null if the document is within limits.
 */
export function checkDocumentLimits(doc: ScreenplayDocument): string | null {
	if (doc.title.length > MAX_TITLE_LENGTH) return 'Title is too long.';
	if (doc.elements.length > MAX_ELEMENTS) return 'Screenplay has too many lines.';
	if (doc.elements.some((el) => el.text.length > MAX_ELEMENT_TEXT_LENGTH)) {
		return 'A screenplay line is too long.';
	}
	if (doc.titlePage) {
		const { title, author, contact } = doc.titlePage;
		if (
			[title, author, contact].some(
				(field) => typeof field !== 'string' || field.length > MAX_TITLE_PAGE_FIELD_LENGTH
			)
		) {
			return 'Title page fields are invalid or too long.';
		}
	}
	if (JSON.stringify(doc).length > MAX_DOCUMENT_BYTES) return 'Screenplay is too large.';
	return null;
}
