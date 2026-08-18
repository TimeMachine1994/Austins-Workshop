<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/ui';
	import DocListItem from '$lib/ui/screenwriter/DocListItem.svelte';
	import EmptyState from '$lib/ui/screenwriter/EmptyState.svelte';
	import ConfirmDialog from '$lib/ui/screenwriter/ConfirmDialog.svelte';
	import {
		createDocument,
		deleteDocument,
		getDocument,
		listDocuments,
		type Scope
	} from '$lib/apps/screenwriter/storage/api';
	import { exportDocument, importDocument } from '$lib/apps/screenwriter/storage/fileIO';
	import type { ScreenplayDocumentSummary } from '$lib/apps/screenwriter/screenplay/types';

	let {
		scope,
		documents: initialDocuments,
		emptyMessage
	}: {
		scope: Scope;
		documents: ScreenplayDocumentSummary[];
		emptyMessage: string;
	} = $props();

	// Writable derived: tracks fresh SSR data on navigation, but can be
	// locally reassigned by refresh() after mutations.
	let documents = $derived(initialDocuments);
	let errorMessage = $state('');
	let confirmOpen = $state(false);
	let pendingDelete = $state<ScreenplayDocumentSummary | null>(null);

	async function refresh() {
		documents = await listDocuments(scope);
	}

	async function run(action: () => Promise<void>, fallback: string) {
		errorMessage = '';
		try {
			await action();
		} catch (err) {
			errorMessage = err instanceof Error ? err.message : fallback;
		}
	}

	function newScript() {
		return run(async () => {
			const doc = await createDocument(scope);
			await goto(`/apps/screenwriter/write/${doc.id}`);
		}, 'Could not create a new script.');
	}

	function handleImport() {
		return run(async () => {
			let imported;
			try {
				imported = await importDocument();
			} catch {
				throw new Error('That file could not be imported. Please choose a valid screenplay JSON file.');
			}
			if (!imported) return;
			const doc = await createDocument(scope, imported);
			await goto(`/apps/screenwriter/write/${doc.id}`);
		}, 'Import failed.');
	}

	function handleExport(id: string) {
		return run(async () => {
			const doc = await getDocument(id);
			await exportDocument(doc);
		}, 'Export failed.');
	}

	function requestDelete(doc: ScreenplayDocumentSummary) {
		pendingDelete = doc;
		confirmOpen = true;
	}

	function confirmDelete() {
		const doc = pendingDelete;
		if (!doc) return;
		return run(async () => {
			await deleteDocument(doc.id);
			await refresh();
		}, 'Delete failed.');
	}
</script>

<div class="flex flex-wrap gap-3">
	<Button variant="primary" onclick={newScript}>New Script</Button>
	<Button variant="secondary" onclick={handleImport}>Import JSON</Button>
</div>

{#if errorMessage}
	<p class="mt-3 text-sm text-danger">{errorMessage}</p>
{/if}

<div class="mt-8">
	{#if documents.length === 0}
		<EmptyState message={emptyMessage} />
	{:else}
		<ul class="divide-y divide-edge border-t border-edge">
			{#each documents as doc (doc.id)}
				<DocListItem
					title={doc.title}
					updatedAt={doc.updatedAt}
					onopen={() => goto(`/apps/screenwriter/write/${doc.id}`)}
					onexport={() => handleExport(doc.id)}
					ondelete={() => requestDelete(doc)}
				/>
			{/each}
		</ul>
	{/if}
</div>

<ConfirmDialog
	bind:open={confirmOpen}
	title="Delete script?"
	message={`Delete "${pendingDelete?.title || 'Untitled Screenplay'}"? This cannot be undone.`}
	onconfirm={confirmDelete}
/>
