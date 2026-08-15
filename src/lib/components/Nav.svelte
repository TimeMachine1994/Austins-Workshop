<script lang="ts">
	import { apps } from '$lib/apps/registry';
</script>

<header class="border-b border-neutral-800 bg-neutral-950">
	<div class="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
		<a href="/" class="text-lg font-semibold text-white">Austin's Workshop</a>
		<nav class="flex gap-4 text-sm text-neutral-300">
			{#each apps.filter((app) => !app.hidden) as app (app.slug)}
				<a href={`/apps/${app.slug}`} class="hover:text-white">{app.title}</a>
			{/each}
		</nav>
	</div>
</header>
