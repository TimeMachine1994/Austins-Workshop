<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title,
		onclose,
		children
	}: {
		open?: boolean;
		title?: string;
		onclose?: () => void;
		children: Snippet;
	} = $props();

	function close() {
		open = false;
		onclose?.();
	}

	function onWindowKeydown(e: KeyboardEvent) {
		if (open && e.key === 'Escape') close();
	}
</script>

<svelte:window onkeydown={onWindowKeydown} />

{#if open}
	<div class="fixed inset-0 z-40 flex items-center justify-center p-4">
		<button
			type="button"
			class="absolute inset-0 h-full w-full cursor-default bg-black/40"
			aria-label="Close dialog"
			onclick={close}
		></button>
		<div
			class="relative w-full max-w-sm rounded-xl border border-edge bg-panel p-6 shadow-xl"
			role="dialog"
			aria-modal="true"
			aria-label={title}
		>
			{#if title}
				<h2 class="mb-4 text-sm font-semibold text-ink">{title}</h2>
			{/if}
			{@render children()}
		</div>
	</div>
{/if}
