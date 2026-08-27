<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/ui';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// Public share pages render full-bleed with their own chrome.
	const isShare = $derived(page.url.pathname.startsWith('/apps/slideshow/s/'));
</script>

{#if isShare}
	{@render children()}
{:else}
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-edge pb-4">
		<a href="/apps/slideshow" class="text-lg font-semibold text-ink">🎞️ Slideshows</a>

		<div class="flex items-center gap-3 text-sm text-ink-muted">
			{#if data.user}
				<span>Signed in as <span class="text-ink">{data.user.username}</span></span>
				<form method="POST" action="/apps/slideshow/logout">
					<Button type="submit" variant="secondary" size="sm">Log out</Button>
				</form>
			{:else}
				<a href="/apps/slideshow/login" class="hover:text-ink">Log in</a>
				<Button href="/apps/slideshow/signup" variant="primary" size="sm">Sign up</Button>
			{/if}
		</div>
	</div>

	{@render children()}
{/if}
