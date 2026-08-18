<script lang="ts">
	import { page } from '$app/state';
	import {
		catalog,
		type CatalogEntry,
		Button,
		Input,
		Card,
		Modal,
		AppCard,
		ThemePicker,
		Toast,
		ConfirmDialog,
		EmptyState,
		DocListItem,
		KeyboardHelpModal
	} from '$lib/ui';
	import type { ThemeId } from '$lib/themes/registry';

	const groups = ['shared', 'workshop', 'screenwriter'].map((originApp) => ({
		originApp,
		entries: catalog.filter((entry) => entry.originApp === originApp)
	}));

	function byName(name: string): CatalogEntry {
		const entry = catalog.find((e) => e.name === name);
		if (!entry) throw new Error(`Component "${name}" is missing from the catalog.`);
		return entry;
	}

	const theme = (page.data.theme ?? 'system') as ThemeId;

	const sampleAppEntry = {
		slug: 'gallery',
		title: 'Gallery',
		description: 'A sample AppCard pointing at this very page.',
		icon: '🧩'
	};

	// Demo state
	let modalOpen = $state(false);
	let helpOpen = $state(false);
	let confirmOpen = $state(false);
	let toastVisible = $state(false);
	let toastTimeout: ReturnType<typeof setTimeout> | undefined;
	let lastAction = $state('');

	function showToast() {
		toastVisible = true;
		clearTimeout(toastTimeout);
		toastTimeout = setTimeout(() => (toastVisible = false), 2000);
	}
</script>

<svelte:head><title>Component Gallery — Austin's Workshop</title></svelte:head>

{#snippet demoCard(entry: CatalogEntry, demo: import('svelte').Snippet)}
	<div class="rounded-xl border border-edge bg-panel p-5">
		<div class="flex flex-wrap items-center gap-2">
			<h3 class="font-medium text-ink">{entry.name}</h3>
			<span
				class="rounded-full border px-2 py-0.5 text-[10px] tracking-wide uppercase
					{entry.status === 'stable' ? 'border-edge text-ink-faint' : 'border-warn-edge bg-warn-panel text-warn'}"
			>
				{entry.status}
			</span>
			<code class="ml-auto text-xs text-ink-faint">{entry.path}</code>
		</div>
		<p class="mt-1 text-sm text-ink-muted">{entry.description}</p>
		<div class="mt-4 rounded-lg border border-edge bg-surface p-4">
			{@render demo()}
		</div>
	</div>
{/snippet}

<h1 class="mb-2 text-3xl font-semibold text-ink">Component Gallery</h1>
<p class="mb-2 text-ink-muted">
	Living reference of every component in <code class="text-ink">$lib/ui</code>, rendered under the
	active theme — switch themes in the nav to see them adapt. Metadata comes straight from
	<code class="text-ink">catalog.ts</code>.
</p>
<p class="mb-10 text-sm text-ink-faint">{catalog.length} components cataloged.</p>

{#each groups as group (group.originApp)}
	<section class="mb-12">
		<h2 class="mb-4 border-b border-edge pb-2 text-lg font-semibold text-ink capitalize">
			{group.originApp}
			<span class="ml-2 text-sm font-normal text-ink-faint">
				{group.originApp === 'shared' ? 'generic primitives' : `origin: ${group.originApp}`}
			</span>
		</h2>
		<div class="grid gap-4 lg:grid-cols-2">
			{#each group.entries as entry (entry.name)}
				{#if entry.name === 'Button'}
					{@render demoCard(entry, buttonDemo)}
				{:else if entry.name === 'Input'}
					{@render demoCard(entry, inputDemo)}
				{:else if entry.name === 'Card'}
					{@render demoCard(entry, cardDemo)}
				{:else if entry.name === 'Modal'}
					{@render demoCard(entry, modalDemo)}
				{:else if entry.name === 'Nav'}
					{@render demoCard(entry, navDemo)}
				{:else if entry.name === 'AppCard'}
					{@render demoCard(entry, appCardDemo)}
				{:else if entry.name === 'ThemePicker'}
					{@render demoCard(entry, themePickerDemo)}
				{:else if entry.name === 'Toast'}
					{@render demoCard(entry, toastDemo)}
				{:else if entry.name === 'ConfirmDialog'}
					{@render demoCard(entry, confirmDemo)}
				{:else if entry.name === 'EmptyState'}
					{@render demoCard(entry, emptyStateDemo)}
				{:else if entry.name === 'DocListItem'}
					{@render demoCard(entry, docListItemDemo)}
				{:else if entry.name === 'KeyboardHelpModal'}
					{@render demoCard(entry, keyboardHelpDemo)}
				{:else}
					{@render demoCard(entry, missingDemo)}
				{/if}
			{/each}
		</div>
	</section>
{/each}

{#snippet buttonDemo()}
	<div class="flex flex-wrap items-center gap-3">
		<Button variant="primary">Primary</Button>
		<Button variant="secondary">Secondary</Button>
		<Button variant="ghost">Ghost</Button>
		<Button variant="danger">Danger</Button>
		<Button variant="primary" size="sm">Small</Button>
		<Button variant="secondary" disabled>Disabled</Button>
	</div>
{/snippet}

{#snippet inputDemo()}
	<div class="flex max-w-xs flex-col gap-4">
		<Input label="Username" name="demo-username" placeholder="ada_lovelace" />
		<Input label="Password" name="demo-password" type="password" error="Password must be at least 8 characters." />
	</div>
{/snippet}

{#snippet cardDemo()}
	<div class="grid gap-4 sm:grid-cols-2">
		<Card>
			<span class="font-medium text-ink">Static card</span>
			<span class="text-sm text-ink-muted">Plain container, no hover states.</span>
		</Card>
		<Card href="/apps/gallery">
			<span class="font-medium text-ink group-hover:underline">Link card</span>
			<span class="text-sm text-ink-muted">Hoverable; navigates on click.</span>
		</Card>
	</div>
{/snippet}

{#snippet modalDemo()}
	<Button variant="secondary" onclick={() => (modalOpen = true)}>Open modal</Button>
	<Modal bind:open={modalOpen} title="Sample modal">
		<p class="text-sm text-ink-muted">Closes on Escape, backdrop click, or the button below.</p>
		<div class="mt-5 flex justify-end">
			<Button variant="primary" size="sm" onclick={() => (modalOpen = false)}>Done</Button>
		</div>
	</Modal>
{/snippet}

{#snippet navDemo()}
	<p class="text-sm text-ink-muted">
		Singleton — it's the live chrome at the top of this page: registry-driven links, active-link
		accent, theme picker, and a disclosure menu below the <code>sm</code> breakpoint.
	</p>
{/snippet}

{#snippet appCardDemo()}
	<div class="max-w-xs">
		<AppCard app={sampleAppEntry} />
	</div>
{/snippet}

{#snippet themePickerDemo()}
	<div class="flex items-center gap-3">
		<ThemePicker value={theme} />
		<span class="text-sm text-ink-muted">Fully functional — changes the real site theme.</span>
	</div>
{/snippet}

{#snippet toastDemo()}
	<Button variant="secondary" onclick={showToast}>Show toast</Button>
	<Toast message="Updated by another session" visible={toastVisible} />
{/snippet}

{#snippet confirmDemo()}
	<div class="flex items-center gap-3">
		<Button variant="danger" onclick={() => (confirmOpen = true)}>Delete something</Button>
		{#if lastAction}<span class="text-sm text-ink-muted">{lastAction}</span>{/if}
	</div>
	<ConfirmDialog
		bind:open={confirmOpen}
		title="Delete script?"
		message={'Delete "Untitled Screenplay"? This cannot be undone.'}
		onconfirm={() => (lastAction = 'Confirmed at ' + new Date().toLocaleTimeString())}
	/>
{/snippet}

{#snippet emptyStateDemo()}
	<EmptyState message="No scripts yet. Create one to get started." />
{/snippet}

{#snippet docListItemDemo()}
	<ul>
		<DocListItem
			title="The Heist at Dusk"
			updatedAt={Date.now() - 1000 * 60 * 42}
			onopen={() => (lastAction = 'Open clicked')}
			onexport={() => (lastAction = 'Export clicked')}
			ondelete={() => (lastAction = 'Delete clicked')}
		/>
	</ul>
	{#if lastAction}<p class="mt-2 text-xs text-ink-faint">{lastAction}</p>{/if}
{/snippet}

{#snippet keyboardHelpDemo()}
	<Button variant="secondary" onclick={() => (helpOpen = true)}>Show shortcuts</Button>
	<KeyboardHelpModal bind:open={helpOpen} />
{/snippet}

{#snippet missingDemo()}
	<p class="text-sm text-warn">No demo wired up for this component yet — add one to the gallery page.</p>
{/snippet}
