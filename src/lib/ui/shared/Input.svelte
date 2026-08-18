<script lang="ts">
	let {
		label,
		error,
		value = $bindable(''),
		type = 'text',
		class: extra = '',
		...rest
	}: {
		label: string;
		error?: string;
		value?: string;
		type?: string;
		class?: string;
		[key: string]: unknown;
	} = $props();
</script>

<label class="flex flex-col gap-1 text-sm text-ink-muted {extra}">
	{label}
	<input
		{type}
		bind:value
		class="rounded-lg border border-edge bg-panel px-3 py-2 text-ink placeholder:text-ink-faint
			focus:border-edge-strong focus:outline-none disabled:text-ink-faint"
		{...rest}
	/>
	{#if error}
		<span class="text-xs text-danger">{error}</span>
	{/if}
</label>
