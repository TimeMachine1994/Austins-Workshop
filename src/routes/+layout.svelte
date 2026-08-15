<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import Nav from '$lib/components/Nav.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-neutral-950 text-neutral-100">
	<Nav />
	<main class="mx-auto max-w-5xl px-6 py-10">
		{@render children()}
	</main>
</div>
