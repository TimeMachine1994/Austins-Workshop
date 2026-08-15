<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1 class="mb-2 text-2xl font-semibold text-white">Virtual Databases</h1>
<p class="mb-8 text-neutral-400">Each section below is one app's own database.</p>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
	{#each data.sections as section (section.slug)}
		<a
			href={`/apps/admin/${section.slug}`}
			class="group flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-neutral-600 hover:bg-neutral-800"
		>
			<span class="text-lg font-medium text-white group-hover:underline">{section.title}</span>
			<span class="text-sm text-neutral-400">{section.description}</span>
			<span class="text-xs text-neutral-500">
				{section.tables.length} {section.tables.length === 1 ? 'table' : 'tables'}
			</span>
		</a>
	{/each}

	{#if data.sections.length === 0}
		<p class="text-neutral-500">No other apps registered yet.</p>
	{/if}
</div>
