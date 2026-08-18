<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/ui';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// The editor route renders full-bleed with its own header; skip the app chrome there.
	const isEditor = $derived(page.url.pathname.startsWith('/apps/screenwriter/write'));

	const tabs = $derived([
		{ href: '/apps/screenwriter', label: 'Public Demo', active: page.url.pathname === '/apps/screenwriter' },
		...(data.user
			? [{ href: '/apps/screenwriter/my', label: 'My Scripts', active: page.url.pathname.startsWith('/apps/screenwriter/my') }]
			: [])
	]);
</script>

{#if isEditor}
	{@render children()}
{:else}
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-edge pb-4">
		<div class="flex items-center gap-5">
			<a href="/apps/screenwriter" class="text-lg font-semibold text-ink">🎬 Screenwriter</a>
			<nav class="flex gap-3 text-sm">
				{#each tabs as tab (tab.href)}
					<a
						href={tab.href}
						class={tab.active ? 'font-medium text-accent' : 'text-ink-muted hover:text-ink'}
					>
						{tab.label}
					</a>
				{/each}
			</nav>
		</div>

		<div class="flex items-center gap-3 text-sm text-ink-muted">
			{#if data.user}
				<span>Signed in as <span class="text-ink">{data.user.username}</span></span>
				<form method="POST" action="/apps/screenwriter/logout">
					<Button type="submit" variant="secondary" size="sm">Log out</Button>
				</form>
			{:else}
				<a href="/apps/screenwriter/login" class="hover:text-ink">Log in</a>
				<Button href="/apps/screenwriter/signup" variant="primary" size="sm">Sign up</Button>
			{/if}
		</div>
	</div>

	{@render children()}
{/if}
