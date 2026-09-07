<script lang="ts">
	import { onDestroy } from 'svelte';
	import { DocumentState } from '$lib/apps/screenwriter/editor/documentState.svelte';
	import Editor from '$lib/apps/screenwriter/editor/Editor.svelte';
	import TitlePage from '$lib/apps/screenwriter/editor/TitlePage.svelte';
	import { getDocument, getDocumentUpdatedAt, saveDocument } from '$lib/apps/screenwriter/storage/api';
	import { exportDocument, exportDocumentAsPDF } from '$lib/apps/screenwriter/storage/fileIO';
	import KeyboardHelpModal from '$lib/ui/screenwriter/KeyboardHelpModal.svelte';
	import Toast from '$lib/ui/screenwriter/Toast.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const backHref = $derived(data.isPublic ? '/apps/screenwriter' : '/apps/screenwriter/my');

	// Per-document editing session: recreated when navigating between
	// documents. lastSavedSnapshot lives on the same derived object so it
	// resets in lockstep with the editing state.
	const session = $derived.by(() => {
		const doc = structuredClone($state.snapshot(data.doc));
		return {
			docState: new DocumentState(doc),
			lastSavedSnapshot: JSON.stringify(doc)
		};
	});
	const docState = $derived(session.docState);

	let saveStatus = $state<'saved' | 'saving' | 'idle'>('idle');
	let showHelp = $state(false);
	let syncToastVisible = $state(false);
	let isExportingPDF = $state(false);

	let saveTimeout: ReturnType<typeof setTimeout> | undefined;
	let syncToastTimeout: ReturnType<typeof setTimeout> | undefined;

	// ---- Debounced autosave (mirrors the standalone app's IndexedDB flow) ----
	$effect(() => {
		// Touch doc.elements/title so this effect re-runs on every edit.
		const snapshot = JSON.stringify(docState.doc);
		if (snapshot === session.lastSavedSnapshot) return;

		saveStatus = 'saving';
		clearTimeout(saveTimeout);
		saveTimeout = setTimeout(async () => {
			try {
				const saved = await saveDocument($state.snapshot(docState.doc));
				// Adopt the server's updatedAt so polling doesn't see our own save as remote.
				docState.doc.updatedAt = saved.updatedAt;
				session.lastSavedSnapshot = JSON.stringify(docState.doc);
				saveStatus = 'saved';
			} catch (err) {
				console.error('Failed to save screenplay:', err);
				saveStatus = 'idle';
			}
		}, 500);
	});

	function flushSave() {
		clearTimeout(saveTimeout);
		const snapshot = JSON.stringify(docState.doc);
		if (snapshot === session.lastSavedSnapshot) return;
		session.lastSavedSnapshot = snapshot;
		void saveDocument($state.snapshot(docState.doc)).catch((err) => {
			console.error('Failed to save screenplay:', err);
		});
	}

	onDestroy(() => {
		flushSave();
		clearInterval(pollInterval);
	});

	// ---- Polling: pick up saves from other sessions (shared account / sandbox) ----
	// Policy: only adopt the remote version when there are no unsaved local
	// edits, so in-progress typing is never clobbered. Otherwise the next
	// local save simply wins (documented last-write-wins).
	const POLL_MS = 5000;
	const pollInterval = setInterval(async () => {
		if (typeof document !== 'undefined' && document.hidden) return;
		if (saveStatus === 'saving') return;
		try {
			const remoteUpdatedAt = await getDocumentUpdatedAt(docState.doc.id);
			if (remoteUpdatedAt <= docState.doc.updatedAt) return;
			if (JSON.stringify(docState.doc) !== session.lastSavedSnapshot) return;

			const remote = await getDocument(docState.doc.id);
			docState.doc = remote;
			session.lastSavedSnapshot = JSON.stringify(remote);
			syncToastVisible = true;
			clearTimeout(syncToastTimeout);
			syncToastTimeout = setTimeout(() => (syncToastVisible = false), 2000);
		} catch {
			// Transient polling errors (offline, etc.) are ignored; next tick retries.
		}
	}, POLL_MS);

	function onTitleInput(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		docState.setTitle(input.value);
	}

	async function handleExport() {
		await exportDocument($state.snapshot(docState.doc));
	}

	async function handleExportPDF() {
		isExportingPDF = true;
		try {
			await exportDocumentAsPDF($state.snapshot(docState.doc));
		} catch (err) {
			console.error('Failed to export PDF:', err);
		} finally {
			isExportingPDF = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (
			e.key === '?' &&
			!(e.target instanceof HTMLTextAreaElement) &&
			!(e.target instanceof HTMLInputElement)
		) {
			showHelp = !showHelp;
		}
		if (e.key === 'Escape') showHelp = false;
	}
</script>

<svelte:head><title>{docState.doc.title || 'Untitled Screenplay'} — Screenwriter</title></svelte:head>

<svelte:window onkeydown={handleKeydown} onbeforeunload={flushSave} />

<div class="min-h-screen bg-surface">
	<header
		class="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-edge bg-panel/80 px-4 py-2 backdrop-blur sm:px-6"
	>
		<div class="flex min-w-0 items-center gap-3">
			<a
				href={backHref}
				class="text-sm text-ink-faint hover:text-ink"
				aria-label="Back to script list"
			>
				←
			</a>
			<input
				value={docState.doc.title}
				oninput={onTitleInput}
				aria-label="Script title"
				class="min-w-0 border-none bg-transparent text-sm font-medium text-ink outline-none focus:underline"
			/>
		</div>
		<div class="flex items-center gap-4 text-xs text-ink-faint">
			{#if data.isPublic}
				<span class="hidden rounded-full border border-edge px-2 py-0.5 sm:inline">Public sandbox</span>
			{/if}
			<span>{saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? 'Saved' : ''}</span>
			<button onclick={handleExport} class="hover:text-ink">Export JSON</button>
			<button onclick={handleExportPDF} class="hover:text-ink" disabled={isExportingPDF}>
				{isExportingPDF ? 'Exporting PDF…' : 'Export PDF'}
			</button>
			<button onclick={() => (showHelp = true)} class="hover:text-ink" aria-label="Keyboard shortcuts">?</button>
		</div>
	</header>

	<main class="space-y-8 px-2 py-8 sm:py-12">
		<TitlePage {docState} />
		<Editor {docState} />
	</main>
</div>

<KeyboardHelpModal bind:open={showHelp} />
<Toast message="Updated by another session" visible={syncToastVisible} />
