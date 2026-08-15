<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function sortHref(column: string) {
		const nextDir = data.sort === column && data.dir === 'asc' ? 'desc' : 'asc';
		return `?sort=${column}&dir=${nextDir}`;
	}

	function pageHref(page: number) {
		const params = new URLSearchParams();
		if (data.sort) params.set('sort', data.sort);
		if (data.dir) params.set('dir', data.dir);
		params.set('page', String(page));
		return `?${params.toString()}`;
	}
</script>

<p class="mb-2 text-sm">
	<a href={`/apps/admin/${data.app.slug}`} class="text-neutral-400 hover:text-white">
		&larr; {data.app.title}
	</a>
</p>
<div class="mb-6 flex items-center justify-between">
	<h1 class="text-2xl font-semibold text-white">
		<span class="font-mono">{data.table.name}</span>
	</h1>
	{#if !data.table.hasCompositeKey}
		<a
			href={`/apps/admin/${data.app.slug}/${data.table.name}/new`}
			class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
		>
			+ New Row
		</a>
	{/if}
</div>

{#if data.table.hasCompositeKey}
	<p class="mb-4 rounded border border-amber-800 bg-amber-950 px-3 py-2 text-sm text-amber-300">
		This table has a composite primary key. Editing/deleting rows isn't supported yet -- showing
		read-only data.
	</p>
{/if}

<div class="overflow-x-auto rounded-xl border border-neutral-800">
	<table class="w-full text-left text-sm">
		<thead class="bg-neutral-900 text-neutral-400">
			<tr>
				{#each data.table.columns as column (column.name)}
					<th class="px-4 py-2 font-medium">
						<a href={sortHref(column.name)} class="hover:text-white">
							{column.name}
							{#if data.sort === column.name}{data.dir === 'asc' ? '\u2191' : '\u2193'}{/if}
						</a>
					</th>
				{/each}
				{#if !data.table.hasCompositeKey}
					<th class="px-4 py-2"></th>
				{/if}
			</tr>
		</thead>
		<tbody class="divide-y divide-neutral-800">
			{#each data.rows as row (row.pk)}
				<tr class="hover:bg-neutral-900">
					{#each data.table.columns as column (column.name)}
						<td class="max-w-xs truncate px-4 py-2 text-neutral-200">
							{row.data[column.name] ?? ''}
						</td>
					{/each}
					{#if !data.table.hasCompositeKey}
						<td class="px-4 py-2 text-right">
							<a
								href={`/apps/admin/${data.app.slug}/${data.table.name}/${row.pk}`}
								class="mr-3 text-neutral-400 hover:text-white">Edit</a
							>
							<form
								method="POST"
								action="?/delete"
								use:enhance
								class="inline"
								onsubmit={(e) => {
									if (!confirm('Delete this row?')) e.preventDefault();
								}}
							>
								<input type="hidden" name="pk" value={row.pk} />
								<button type="submit" class="text-red-400 hover:text-red-300">Delete</button>
							</form>
						</td>
					{/if}
				</tr>
			{/each}

			{#if data.rows.length === 0}
				<tr>
					<td colspan={data.table.columns.length + 1} class="px-4 py-6 text-center text-neutral-500">
						No rows.
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>

{#if data.pageCount > 1}
	<div class="mt-4 flex items-center gap-3 text-sm text-neutral-400">
		<a
			href={pageHref(Math.max(1, data.page - 1))}
			class:opacity-40={data.page <= 1}
			class="hover:text-white">Prev</a
		>
		<span>Page {data.page} of {data.pageCount} ({data.total} rows)</span>
		<a
			href={pageHref(Math.min(data.pageCount, data.page + 1))}
			class:opacity-40={data.page >= data.pageCount}
			class="hover:text-white">Next</a
		>
	</div>
{/if}
