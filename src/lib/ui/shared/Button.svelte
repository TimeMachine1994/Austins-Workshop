<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
	type Size = 'sm' | 'md';

	let {
		variant = 'secondary',
		size = 'md',
		href,
		type = 'button',
		class: extra = '',
		children,
		...rest
	}: {
		variant?: Variant;
		size?: Size;
		/** Renders an <a> instead of a <button> when set. */
		href?: string;
		type?: 'button' | 'submit' | 'reset';
		class?: string;
		children: Snippet;
		[key: string]: unknown;
	} = $props();

	const base =
		'inline-flex items-center justify-center rounded-lg font-medium transition-colors ' +
		'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ' +
		'disabled:pointer-events-none disabled:opacity-50';

	const variants: Record<Variant, string> = {
		primary: 'bg-accent text-on-accent hover:bg-accent-hover',
		secondary: 'border border-edge text-ink hover:border-edge-strong hover:bg-panel-hover',
		ghost: 'text-ink-muted hover:bg-panel-hover hover:text-ink',
		danger: 'border border-danger-edge text-danger hover:bg-danger-panel'
	};

	const sizes: Record<Size, string> = {
		sm: 'px-2.5 py-1.5 text-xs',
		md: 'px-4 py-2 text-sm'
	};

	const classes = $derived(`${base} ${variants[variant]} ${sizes[size]} ${extra}`);
</script>

{#if href}
	<a {href} class={classes} {...rest}>{@render children()}</a>
{:else}
	<button {type} class={classes} {...rest}>{@render children()}</button>
{/if}
