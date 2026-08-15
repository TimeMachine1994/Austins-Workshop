<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

{#if data.user}
	<div class="mb-6 flex items-center justify-between border-b border-neutral-800 pb-4">
		<a href="/apps/admin" class="text-lg font-semibold text-white">🛠️ Admin</a>
		<div class="flex items-center gap-4 text-sm text-neutral-400">
			<span>Signed in as <span class="text-neutral-200">{data.user.username}</span></span>
			<form method="POST" action="/apps/admin/logout">
				<button type="submit" class="rounded border border-neutral-700 px-3 py-1 hover:border-neutral-500">
					Log out
				</button>
			</form>
		</div>
	</div>
{/if}

{@render children()}
