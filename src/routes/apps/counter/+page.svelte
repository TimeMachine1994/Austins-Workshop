<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/ui';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<h1 class="mb-2 text-2xl font-semibold text-ink">Counter</h1>
<p class="mb-6 text-ink-muted">
	Value persisted in its own libSQL database at <code class="text-ink">data/counter.db</code>.
</p>

<div class="flex items-center gap-4">
	<span class="text-5xl font-bold text-ink">{data.value}</span>
	<form method="POST" action="?/increment" use:enhance>
		<Button type="submit" variant="primary">Increment</Button>
	</form>
	<form method="POST" action="?/reset" use:enhance>
		<Button type="submit" variant="secondary">Reset</Button>
	</form>
</div>
