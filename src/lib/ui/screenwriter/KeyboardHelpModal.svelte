<script lang="ts">
	import Modal from '$lib/ui/shared/Modal.svelte';

	let { open = $bindable(false) }: { open?: boolean } = $props();

	const shortcuts = [
		['Tab', 'Cycle element type forward'],
		['Shift + Tab', 'Cycle element type backward'],
		['Enter', 'New line (type follows context)'],
		['⌘/Ctrl + 1–6', 'Jump to specific element type'],
		['?', 'Toggle this help']
	];
</script>

<Modal bind:open title="Keyboard Shortcuts">
	<dl class="space-y-2 text-sm text-ink-muted">
		{#each shortcuts as [key, description] (key)}
			<div class="flex justify-between gap-4">
				<dt class="shrink-0 font-medium text-ink">{key}</dt>
				<dd class="text-right">{description}</dd>
			</div>
		{/each}
	</dl>
</Modal>
