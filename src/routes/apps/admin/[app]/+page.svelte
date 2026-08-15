<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<p class="mb-2 text-sm">
	<a href="/apps/admin" class="text-neutral-400 hover:text-white">&larr; Virtual databases</a>
</p>
<h1 class="mb-6 text-2xl font-semibold text-white">{data.app.title}</h1>

<div class="flex flex-col divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-900">
	{#each data.tables as table (table.name)}
		<a
			href={`/apps/admin/${data.app.slug}/${table.name}`}
			class="flex items-center justify-between px-5 py-3 hover:bg-neutral-800"
		>
			<span class="font-mono text-white">{table.name}</span>
			<span class="text-sm text-neutral-500">{table.rowCount} rows</span>
		</a>
	{/each}

	{#if data.tables.length === 0}
		<p class="px-5 py-3 text-neutral-500">No tables found.</p>
	{/if}
</div>
