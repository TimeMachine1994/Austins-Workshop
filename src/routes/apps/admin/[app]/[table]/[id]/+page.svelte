<script lang="ts">
	import { Button } from '$lib/ui';
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();
</script>

<p class="mb-2 text-sm">
	<a href={`/apps/admin/${data.app.slug}/${data.table.name}`} class="text-ink-muted hover:text-ink">
		&larr; {data.table.name}
	</a>
</p>
<h1 class="mb-6 text-2xl font-semibold text-ink">
	Edit row in <span class="font-mono">{data.table.name}</span>
</h1>

{#if form?.error}
	<p class="mb-4 rounded-lg border border-danger-edge bg-danger-panel px-3 py-2 text-sm text-danger">{form.error}</p>
{/if}

<form method="POST" class="flex max-w-lg flex-col gap-4">
	{#each data.table.columns as column (column.name)}
		<label class="flex flex-col gap-1 text-sm text-ink-muted">
			{column.name}
			{#if column.isPrimaryKey}<span class="text-ink-faint">(read-only)</span>{/if}
			{#if column.type.toUpperCase() === 'TEXT' && !column.isPrimaryKey}
				<textarea
					name={column.name}
					required={column.notNull}
					class="rounded-lg border border-edge bg-panel px-3 py-2 text-ink focus:border-edge-strong focus:outline-none"
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
					class="rounded-lg border border-edge bg-panel px-3 py-2 text-ink focus:border-edge-strong focus:outline-none disabled:text-ink-faint"
				/>
			{/if}
		</label>
	{/each}

	<Button type="submit" variant="primary">Save</Button>
</form>
