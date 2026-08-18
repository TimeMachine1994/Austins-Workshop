import type { ElementType, ScreenplayDocument, ScreenplayElement, TitlePage } from '$lib/apps/screenwriter/screenplay/types';
import { createElement } from '$lib/apps/screenwriter/screenplay/types';
import { cycleBackward, cycleForward, ENTER_TRANSITION, UPPERCASE_TYPES } from '$lib/apps/screenwriter/screenplay/elementTypes';

export interface CaretRequest {
	elementId: string;
	offset: number;
}

/**
 * Reactive wrapper around a ScreenplayDocument using Svelte 5 runes.
 * Owns all editing operations (Tab cycling, Enter splitting, Backspace
 * merging) so the Editor component can stay focused on DOM/focus concerns.
 */
export class DocumentState {
	doc = $state<ScreenplayDocument>() as ScreenplayDocument;
	/** Set after an operation to tell the Editor where to place the caret next tick. */
	pendingCaret = $state<CaretRequest | null>(null);

	constructor(doc: ScreenplayDocument) {
		this.doc = doc;
	}

	get elements(): ScreenplayElement[] {
		return this.doc.elements;
	}

	private touch() {
		this.doc.updatedAt = Date.now();
	}

	private indexOf(id: string): number {
		return this.doc.elements.findIndex((e) => e.id === id);
	}

	updateText(id: string, text: string) {
		const el = this.doc.elements.find((e) => e.id === id);
		if (!el) return;
		el.text = UPPERCASE_TYPES.has(el.type) ? text.toUpperCase() : text;
		this.touch();
	}

	setType(id: string, type: ElementType) {
		const el = this.doc.elements.find((e) => e.id === id);
		if (!el) return;
		el.type = type;
		if (UPPERCASE_TYPES.has(type)) el.text = el.text.toUpperCase();
		this.touch();
		this.pendingCaret = { elementId: id, offset: -1 };
	}

	cycleType(id: string, direction: 'forward' | 'backward') {
		const el = this.doc.elements.find((e) => e.id === id);
		if (!el) return;
		const next = direction === 'forward' ? cycleForward(el.type) : cycleBackward(el.type);
		this.setType(id, next);
	}

	/** Split the element at `id` into two at `caretOffset`, pressing Enter. */
	handleEnter(id: string, caretOffset: number) {
		const idx = this.indexOf(id);
		if (idx === -1) return;
		const el = this.doc.elements[idx];
		const before = el.text.slice(0, caretOffset);
		const after = el.text.slice(caretOffset);
		el.text = before;

		const newType = ENTER_TRANSITION[el.type];
		const newEl = createElement(newType, after);
		this.doc.elements.splice(idx + 1, 0, newEl);
		this.touch();
		this.pendingCaret = { elementId: newEl.id, offset: 0 };
	}

	/** Merge element `id` into the previous element (Backspace at offset 0). */
	handleBackspaceMerge(id: string) {
		const idx = this.indexOf(id);
		if (idx <= 0) return; // nothing before to merge into
		const current = this.doc.elements[idx];
		const prev = this.doc.elements[idx - 1];
		const mergeOffset = prev.text.length;
		prev.text += current.text;
		this.doc.elements.splice(idx, 1);
		this.touch();
		this.pendingCaret = { elementId: prev.id, offset: mergeOffset };
	}

	focusPrevious(id: string, caretOffset: number) {
		const idx = this.indexOf(id);
		if (idx <= 0) return;
		const prev = this.doc.elements[idx - 1];
		this.pendingCaret = { elementId: prev.id, offset: Math.min(caretOffset, prev.text.length) };
	}

	focusNext(id: string, caretOffset: number) {
		const idx = this.indexOf(id);
		if (idx === -1 || idx === this.doc.elements.length - 1) return;
		const next = this.doc.elements[idx + 1];
		this.pendingCaret = { elementId: next.id, offset: Math.min(caretOffset, next.text.length) };
	}

	setTitle(title: string) {
		this.doc.title = title;
		this.touch();
	}

	setTitlePageField(field: keyof TitlePage, value: string) {
		this.doc.titlePage[field] = value;
		this.touch();
	}

	consumeCaretRequest(): CaretRequest | null {
		const req = this.pendingCaret;
		this.pendingCaret = null;
		return req;
	}
}
