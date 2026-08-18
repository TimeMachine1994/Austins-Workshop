<script lang="ts">
	import { Button } from '$lib/ui';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

{#if data.user}
	<div class="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-edge pb-4">
		<a href="/apps/admin" class="text-lg font-semibold text-ink">🛠️ Admin</a>
		<div class="flex items-center gap-4 text-sm text-ink-muted">
			<span>Signed in as <span class="text-ink">{data.user.username}</span></span>
			<form method="POST" action="/apps/admin/logout">
				<Button type="submit" variant="secondary" size="sm">Log out</Button>
			</form>
		</div>
	</div>
{/if}

{@render children()}
