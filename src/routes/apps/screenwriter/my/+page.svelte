<script lang="ts">
	import { Button } from '$lib/ui';
	import ScriptList from '$lib/apps/screenwriter/components/ScriptList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Screenwriter — My Scripts</title></svelte:head>

<div class="flex flex-wrap items-start justify-between gap-3">
	<div>
		<h1 class="text-3xl font-semibold tracking-tight text-ink">My Scripts</h1>
		<p class="mt-1 text-sm text-ink-muted">
			Private to your account. Anyone signed in with this account can edit them.
		</p>
	</div>
	{#if data.documents.length > 0}
		<Button href="/apps/screenwriter/api/export/zip" variant="secondary" data-sveltekit-preload-data="off">
			Download all as ZIP
		</Button>
	{/if}
</div>

<div class="mt-8">
	<ScriptList
		scope="mine"
		documents={data.documents}
		emptyMessage="No scripts yet. Create one, or import a JSON backup."
	/>
</div>
