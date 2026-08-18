/**
 * Component library catalog — the index of every reusable component in
 * src/lib/ui/, organized by the app it originated in.
 *
 * Every component added to the library MUST get an entry here. This typed
 * catalog is the source of truth the hidden /apps/gallery route renders
 * (every component, live, under the active theme) — new components also
 * need a demo snippet wired up on that page.
 *
 * Folder convention:
 *   src/lib/ui/<originApp>/  — components born in that app (workshop = portal shell)
 *   src/lib/ui/shared/       — generic primitives, promoted once reused across apps
 *
 * Library rules (see README.md in this folder):
 *   - semantic theme tokens only (bg-surface, text-ink, ...), never raw palette classes
 *   - never import from $lib/apps/* — data arrives via props/snippets only
 */
export type CatalogEntry = {
	/** Component name as exported from $lib/ui. */
	name: string;
	/** App the component originated in ('shared' for born-generic primitives). */
	originApp: string;
	/** Path relative to src/lib/ui/. */
	path: string;
	description: string;
	status: 'stable' | 'experimental';
};

export const catalog: CatalogEntry[] = [
	{
		name: 'Button',
		originApp: 'shared',
		path: 'shared/Button.svelte',
		description: 'Button or link-as-button. Variants: primary (accent), secondary, ghost, danger. Sizes: sm, md.',
		status: 'stable'
	},
	{
		name: 'Input',
		originApp: 'shared',
		path: 'shared/Input.svelte',
		description: 'Labeled text input with optional error message. Bindable value.',
		status: 'stable'
	},
	{
		name: 'Card',
		originApp: 'shared',
		path: 'shared/Card.svelte',
		description: 'Panel card; renders as a hoverable link when href is set.',
		status: 'stable'
	},
	{
		name: 'Modal',
		originApp: 'shared',
		path: 'shared/Modal.svelte',
		description: 'Centered dialog with backdrop; closes on Escape or backdrop click. Bindable open.',
		status: 'stable'
	},
	{
		name: 'Nav',
		originApp: 'workshop',
		path: 'workshop/Nav.svelte',
		description: 'Portal top navigation: registry-driven app links, active state, theme picker, mobile disclosure menu.',
		status: 'stable'
	},
	{
		name: 'AppCard',
		originApp: 'workshop',
		path: 'workshop/AppCard.svelte',
		description: 'Homepage grid card for a registered mini-app.',
		status: 'stable'
	},
	{
		name: 'ThemePicker',
		originApp: 'workshop',
		path: 'workshop/ThemePicker.svelte',
		description: 'System/Light/Dark select; applies data-theme instantly and persists the choice in a cookie.',
		status: 'stable'
	},
	{
		name: 'Toast',
		originApp: 'screenwriter',
		path: 'screenwriter/Toast.svelte',
		description: 'Bottom-centered transient status pill (aria-live polite). Props: message, visible.',
		status: 'stable'
	},
	{
		name: 'ConfirmDialog',
		originApp: 'screenwriter',
		path: 'screenwriter/ConfirmDialog.svelte',
		description: 'Modal-based destructive-action confirmation with Cancel / confirm buttons.',
		status: 'stable'
	},
	{
		name: 'EmptyState',
		originApp: 'screenwriter',
		path: 'screenwriter/EmptyState.svelte',
		description: 'Dashed-border placeholder for empty lists.',
		status: 'stable'
	},
	{
		name: 'DocListItem',
		originApp: 'screenwriter',
		path: 'screenwriter/DocListItem.svelte',
		description: 'List row with title, edited-at timestamp, and Export/Delete actions (hover-revealed on pointer devices, always visible on touch).',
		status: 'stable'
	},
	{
		name: 'KeyboardHelpModal',
		originApp: 'screenwriter',
		path: 'screenwriter/KeyboardHelpModal.svelte',
		description: 'Modal listing the editor keyboard shortcuts.',
		status: 'stable'
	}
];
