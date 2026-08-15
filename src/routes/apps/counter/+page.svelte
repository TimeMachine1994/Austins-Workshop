<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1 class="mb-2 text-2xl font-semibold text-white">Counter</h1>
<p class="mb-6 text-neutral-400">
	Value persisted in its own libSQL database at <code class="text-neutral-300">data/counter.db</code>.
</p>

<div class="flex items-center gap-4">
	<span class="text-5xl font-bold text-white">{data.value}</span>
	<form method="POST" action="?/increment" use:enhance>
		<button
			type="submit"
			class="rounded-lg bg-white px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-200"
		>
			Increment
		</button>
	</form>
	<form method="POST" action="?/reset" use:enhance>
		<button
			type="submit"
			class="rounded-lg border border-neutral-700 px-4 py-2 font-medium text-neutral-300 hover:border-neutral-500"
		>
			Reset
		</button>
	</form>
</div>
