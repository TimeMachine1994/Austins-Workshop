<script lang="ts">
	import { apps } from '$lib/apps/registry';
	import { AppCard } from '$lib/ui';
</script>

<h1 class="mb-2 text-3xl font-semibold text-ink">Mini-App Demos</h1>
<p class="mb-8 text-ink-muted">
	A portal for "one-and-done" apps, each isolated with its own database.
</p>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each apps.filter((app) => !app.hidden) as app (app.slug)}
		<AppCard {app} />
	{/each}
</div>
