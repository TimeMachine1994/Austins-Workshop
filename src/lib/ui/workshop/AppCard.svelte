<script lang="ts">
	import type { AppEntry } from '$lib/apps/registry';
	import Card from '$lib/ui/shared/Card.svelte';

	let { app }: { app: AppEntry } = $props();
</script>

<Card href={`/apps/${app.slug}`}>
	<span class="text-3xl">{app.icon}</span>
	<span class="text-lg font-medium text-ink group-hover:underline">{app.title}</span>
	<span class="text-sm text-ink-muted">{app.description}</span>
</Card>
