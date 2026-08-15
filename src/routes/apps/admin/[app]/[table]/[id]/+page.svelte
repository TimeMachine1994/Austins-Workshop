<script lang="ts">
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();
</script>

<p class="mb-2 text-sm">
	<a href={`/apps/admin/${data.app.slug}/${data.table.name}`} class="text-neutral-400 hover:text-white">
		&larr; {data.table.name}
	</a>
</p>
<h1 class="mb-6 text-2xl font-semibold text-white">
	Edit row in <span class="font-mono">{data.table.name}</span>
</h1>

{#if form?.error}
	<p class="mb-4 rounded border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">{form.error}</p>
{/if}

<form method="POST" class="flex max-w-lg flex-col gap-4">
	{#each data.table.columns as column (column.name)}
		<label class="flex flex-col gap-1 text-sm text-neutral-300">
			{column.name}
			{#if column.isPrimaryKey}<span class="text-neutral-500">(read-only)</span>{/if}
			{#if column.type.toUpperCase() === 'TEXT' && !column.isPrimaryKey}
				<textarea
					name={column.name}
					required={column.notNull}
					class="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
					>{data.row[column.name] ?? ''}</textarea
				>
			{:else}
				<input
					name={column.name}
					type="text"
					value={data.row[column.name] ?? ''}
					readonly={column.isPrimaryKey}
					disabled={column.isPrimaryKey}
					required={column.notNull}
					class="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white disabled:text-neutral-500"
				/>
			{/if}
		</label>
	{/each}

	<button type="submit" class="rounded-lg bg-white px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-200">
		Save
	</button>
</form>
