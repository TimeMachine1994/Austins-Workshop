<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		href,
		class: extra = '',
		children,
		...rest
	}: {
		/** Renders a clickable <a> card with hover states when set. */
		href?: string;
		class?: string;
		children: Snippet;
		[key: string]: unknown;
	} = $props();

	const base = 'rounded-xl border border-edge bg-panel p-5';
	const interactive = 'transition hover:border-edge-strong hover:bg-panel-hover';
</script>

{#if href}
	<a {href} class="group flex flex-col gap-2 {base} {interactive} {extra}" {...rest}>
		{@render children()}
	</a>
{:else}
	<div class={`${base} ${extra}`} {...rest}>
		{@render children()}
	</div>
{/if}
