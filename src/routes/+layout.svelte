<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { Nav } from '$lib/ui';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// The screenwriter editor renders a full-width "paper" page (wider than the
	// portal's max-w-5xl shell) with its own sticky header — give it full bleed.
	const fullBleed = $derived(page.url.pathname.startsWith('/apps/screenwriter/write'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-surface text-ink">
	<Nav theme={data.theme} />
	{#if fullBleed}
		{@render children()}
	{:else}
		<main class="mx-auto max-w-5xl px-6 py-10">
			{@render children()}
		</main>
	{/if}
</div>
