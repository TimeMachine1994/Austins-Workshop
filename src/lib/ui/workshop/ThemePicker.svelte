<script lang="ts">
	import { themes, THEME_COOKIE_NAME, type ThemeId } from '$lib/themes/registry';

	let { value }: { value: ThemeId } = $props();

	function onChange(e: Event) {
		const next = (e.currentTarget as HTMLSelectElement).value as ThemeId;
		// Apply immediately (pure CSS swap), persist for SSR on future loads.
		document.documentElement.dataset.theme = next;
		document.cookie = `${THEME_COOKIE_NAME}=${next}; path=/; max-age=31536000; samesite=lax`;
	}
</script>

<label class="flex items-center gap-1.5 text-sm text-ink-muted">
	<span class="sr-only">Theme</span>
	<svg
		aria-hidden="true"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		class="h-4 w-4"
	>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
	</svg>
	<select
		{value}
		onchange={onChange}
		class="cursor-pointer rounded-lg border border-edge bg-panel px-2 py-1 text-xs text-ink
			hover:border-edge-strong focus:border-edge-strong focus:outline-none"
	>
		{#each themes as theme (theme.id)}
			<option value={theme.id}>{theme.label}</option>
		{/each}
	</select>
</label>
