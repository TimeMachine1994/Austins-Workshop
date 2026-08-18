/**
 * Barrel export for the component library.
 * Usage: import { Button, Card } from '$lib/ui';
 */
export { default as Button } from './shared/Button.svelte';
export { default as Input } from './shared/Input.svelte';
export { default as Card } from './shared/Card.svelte';
export { default as Modal } from './shared/Modal.svelte';

export { default as Nav } from './workshop/Nav.svelte';
export { default as AppCard } from './workshop/AppCard.svelte';
export { default as ThemePicker } from './workshop/ThemePicker.svelte';

export { default as Toast } from './screenwriter/Toast.svelte';
export { default as ConfirmDialog } from './screenwriter/ConfirmDialog.svelte';
export { default as EmptyState } from './screenwriter/EmptyState.svelte';
export { default as DocListItem } from './screenwriter/DocListItem.svelte';
export { default as KeyboardHelpModal } from './screenwriter/KeyboardHelpModal.svelte';

export { catalog, type CatalogEntry } from './catalog';
