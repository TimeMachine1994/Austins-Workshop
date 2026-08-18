/**
 * Central registry of site themes.
 *
 * To add a new theme:
 *   1. Create src/lib/themes/<id>.css defining the semantic variables under
 *      `:root[data-theme='<id>']` (see dark.css for the full variable list).
 *   2. Import it from src/app.css.
 *   3. Add one entry below.
 *
 * Components never reference themes directly — they use only the semantic
 * Tailwind utilities (bg-surface, text-ink, border-edge, ...) defined in
 * src/app.css, so new themes require zero component changes.
 */
export type ThemeId = 'system' | 'light' | 'dark';

export type ThemeEntry = {
	id: ThemeId;
	label: string;
	description: string;
};

export const themes: ThemeEntry[] = [
	{ id: 'system', label: 'System', description: 'Follow the operating system preference.' },
	{ id: 'light', label: 'Light', description: 'Light surfaces, dark text.' },
	{ id: 'dark', label: 'Dark', description: 'Dark surfaces, light text.' }
];

export const DEFAULT_THEME: ThemeId = 'system';

export const THEME_COOKIE_NAME = 'theme';

export function isThemeId(value: string): value is ThemeId {
	return themes.some((t) => t.id === value);
}
