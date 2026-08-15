<script lang="ts">
	import { apps } from '$lib/apps/registry';
	import AppCard from '$lib/components/AppCard.svelte';
</script>

<h1 class="mb-2 text-3xl font-semibold text-white">Mini-App Demos</h1>
<p class="mb-8 text-neutral-400">
	A portal for "one-and-done" apps, each isolated with its own database.
</p>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each apps.filter((app) => !app.hidden) as app (app.slug)}
		<AppCard {app} />
	{/each}
</div>
