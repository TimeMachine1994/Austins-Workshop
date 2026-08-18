<script lang="ts">
	let {
		title,
		updatedAt,
		onopen,
		onexport,
		ondelete
	}: {
		title: string;
		updatedAt: number;
		onopen: () => void;
		onexport: () => void;
		ondelete: () => void;
	} = $props();

	function formatDate(ts: number): string {
		return new Date(ts).toLocaleString(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}
</script>

<li class="group flex items-center justify-between gap-3 py-4">
	<button type="button" class="min-w-0 flex-1 cursor-pointer text-left" onclick={onopen}>
		<p class="truncate font-medium text-ink">{title || 'Untitled Screenplay'}</p>
		<p class="text-xs text-ink-faint">Edited {formatDate(updatedAt)}</p>
	</button>
	<!-- Actions: always visible on touch, hover/focus-revealed on pointer devices. -->
	<div
		class="flex gap-2 sm:opacity-0 sm:transition-opacity sm:group-focus-within:opacity-100 sm:group-hover:opacity-100"
	>
		<button
			type="button"
			onclick={onexport}
			class="rounded px-2 py-1 text-xs text-ink-muted hover:bg-panel-hover hover:text-ink"
		>
			Export
		</button>
		<button
			type="button"
			onclick={ondelete}
			class="rounded px-2 py-1 text-xs text-danger hover:bg-danger-panel"
		>
			Delete
		</button>
	</div>
</li>
