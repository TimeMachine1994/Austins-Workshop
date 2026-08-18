<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<p class="mb-2 text-sm">
	<a href="/apps/admin" class="text-ink-muted hover:text-ink">&larr; Virtual databases</a>
</p>
<h1 class="mb-6 text-2xl font-semibold text-ink">{data.app.title}</h1>

<div class="flex flex-col divide-y divide-edge rounded-xl border border-edge bg-panel">
	{#each data.tables as table (table.name)}
		<a
			href={`/apps/admin/${data.app.slug}/${table.name}`}
			class="flex items-center justify-between px-5 py-3 hover:bg-panel-hover"
		>
			<span class="font-mono text-ink">{table.name}</span>
			<span class="text-sm text-ink-faint">{table.rowCount} rows</span>
		</a>
	{/each}

	{#if data.tables.length === 0}
		<p class="px-5 py-3 text-ink-faint">No tables found.</p>
	{/if}
</div>
