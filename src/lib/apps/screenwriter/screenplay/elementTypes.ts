import type { ElementType } from './types';

/**
 * Tab cycles forward through this list starting from the current type.
 * Shift+Tab cycles backward. Scene Heading and Transition are intentionally
 * excluded from the Tab cycle (reachable via Cmd/Ctrl+number shortcuts) since
 * they are used far less frequently and cluttering the cycle hurts flow.
 */
export const TAB_CYCLE: ElementType[] = ['action', 'character', 'dialogue', 'parenthetical'];

/**
 * When the user presses Enter at the end of a line of a given type, what
 * type should the newly created line default to? This mirrors conventional
 * screenwriting software behavior (e.g. Final Draft).
 */
export const ENTER_TRANSITION: Record<ElementType, ElementType> = {
	scene_heading: 'action',
	action: 'action',
	character: 'dialogue',
	dialogue: 'action',
	parenthetical: 'dialogue',
	transition: 'scene_heading'
};

export const ELEMENT_LABELS: Record<ElementType, string> = {
	scene_heading: 'Scene Heading',
	action: 'Action',
	character: 'Character',
	dialogue: 'Dialogue',
	parenthetical: 'Parenthetical',
	transition: 'Transition'
};

/** Element types whose text is auto-uppercased as the user types. */
export const UPPERCASE_TYPES: ReadonlySet<ElementType> = new Set([
	'scene_heading',
	'character',
	'transition'
]);

/** Hard shortcuts: Cmd/Ctrl + number to jump directly to a type. */
export const HOTKEY_TYPES: Record<string, ElementType> = {
	'1': 'scene_heading',
	'2': 'action',
	'3': 'character',
	'4': 'dialogue',
	'5': 'parenthetical',
	'6': 'transition'
};

export function cycleForward(type: ElementType): ElementType {
	const idx = TAB_CYCLE.indexOf(type);
	if (idx === -1) return TAB_CYCLE[0];
	return TAB_CYCLE[(idx + 1) % TAB_CYCLE.length];
}

export function cycleBackward(type: ElementType): ElementType {
	const idx = TAB_CYCLE.indexOf(type);
	if (idx === -1) return TAB_CYCLE[TAB_CYCLE.length - 1];
	return TAB_CYCLE[(idx - 1 + TAB_CYCLE.length) % TAB_CYCLE.length];
}
