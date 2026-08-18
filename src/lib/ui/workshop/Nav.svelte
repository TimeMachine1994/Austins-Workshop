<script lang="ts">
	import { page } from '$app/state';
	import { apps } from '$lib/apps/registry';
	import type { ThemeId } from '$lib/themes/registry';
	import ThemePicker from './ThemePicker.svelte';

	let { theme }: { theme: ThemeId } = $props();

	let menuOpen = $state(false);

	const visibleApps = apps.filter((app) => !app.hidden);

	// Close the mobile menu on navigation.
	$effect(() => {
		page.url.pathname;
		menuOpen = false;
	});
</script>

<header class="border-b border-edge bg-surface">
	<div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
		<a href="/" class="text-lg font-semibold text-ink">Austin's Workshop</a>

		<div class="flex items-center gap-4">
			<nav class="hidden gap-4 text-sm sm:flex">
				{#each visibleApps as app (app.slug)}
					<a
						href={`/apps/${app.slug}`}
						class={page.url.pathname.startsWith(`/apps/${app.slug}`)
							? 'text-accent'
							: 'text-ink-muted hover:text-ink'}
					>
						{app.title}
					</a>
				{/each}
			</nav>

			<ThemePicker value={theme} />

			<button
				type="button"
				class="rounded-lg border border-edge p-1.5 text-ink-muted hover:border-edge-strong hover:text-ink sm:hidden"
				aria-label="Toggle navigation menu"
				aria-expanded={menuOpen}
				onclick={() => (menuOpen = !menuOpen)}
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					class="h-5 w-5"
				>
					{#if menuOpen}
						<path d="M6 6l12 12M18 6L6 18" />
					{:else}
						<path d="M4 7h16M4 12h16M4 17h16" />
					{/if}
				</svg>
			</button>
		</div>
	</div>

	{#if menuOpen}
		<nav class="flex flex-col border-t border-edge px-6 py-2 sm:hidden">
			{#each visibleApps as app (app.slug)}
				<a
					href={`/apps/${app.slug}`}
					class="py-2 text-sm {page.url.pathname.startsWith(`/apps/${app.slug}`)
						? 'text-accent'
						: 'text-ink-muted hover:text-ink'}"
				>
					{app.title}
				</a>
			{/each}
		</nav>
	{/if}
</header>
