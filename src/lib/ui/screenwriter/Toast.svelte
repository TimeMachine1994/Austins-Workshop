<script lang="ts">
	let { message, visible }: { message: string; visible: boolean } = $props();
</script>

<div
	class="pointer-events-none fixed bottom-8 left-1/2 z-30 -translate-x-1/2 rounded-full
		bg-ink px-3.5 py-1.5 text-xs tracking-wide text-surface uppercase
		transition-all duration-250 {visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}"
	role="status"
	aria-live="polite"
>
	{message}
</div>
