<script lang="ts">
	import { Card } from '$lib/ui';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1 class="mb-2 text-2xl font-semibold text-ink">Virtual Databases</h1>
<p class="mb-8 text-ink-muted">Each section below is one app's own database.</p>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each data.sections as section (section.slug)}
		<Card href={`/apps/admin/${section.slug}`}>
			<span class="text-lg font-medium text-ink group-hover:underline">{section.title}</span>
			<span class="text-sm text-ink-muted">{section.description}</span>
			<span class="text-xs text-ink-faint">
				{section.tables.length} {section.tables.length === 1 ? 'table' : 'tables'}
			</span>
		</Card>
	{/each}

	{#if data.sections.length === 0}
		<p class="text-ink-faint">No other apps registered yet.</p>
	{/if}
</div>
