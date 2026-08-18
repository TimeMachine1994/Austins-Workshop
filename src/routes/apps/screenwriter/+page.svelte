<script lang="ts">
	import ScriptList from '$lib/apps/screenwriter/components/ScriptList.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Screenwriter — Public Demo</title></svelte:head>

<h1 class="text-3xl font-semibold tracking-tight text-ink">Public Demo Sandbox</h1>
<p class="mt-1 text-sm text-ink-muted">
	A minimal, keyboard-first screenwriting tool. Everything here is shared: any visitor can open,
	edit, or delete these scripts. Sign up to keep scripts of your own.
</p>

<div class="mt-8">
	<ScriptList
		scope="public"
		documents={data.documents}
		emptyMessage="No scripts yet. Create one to get started."
	/>
</div>
