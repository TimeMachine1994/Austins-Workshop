<script lang="ts">
	import type { AppEntry } from '$lib/apps/registry';

	let { app }: { app: AppEntry } = $props();
</script>

<a
	href={`/apps/${app.slug}`}
	class="group flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition hover:border-neutral-600 hover:bg-neutral-800"
>
	<span class="text-3xl">{app.icon}</span>
	<span class="text-lg font-medium text-white group-hover:underline">{app.title}</span>
	<span class="text-sm text-neutral-400">{app.description}</span>
</a>
