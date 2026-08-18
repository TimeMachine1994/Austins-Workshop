<script lang="ts">
	import { Button, Input } from '$lib/ui';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1 class="mb-6 text-2xl font-semibold text-ink">Admin Login</h1>

<form method="POST" class="flex max-w-sm flex-col gap-4">
	{#if form?.error}
		<p class="rounded-lg border border-danger-edge bg-danger-panel px-3 py-2 text-sm text-danger">
			{form.error}
		</p>
	{/if}

	<Input label="Username" name="username" type="text" autocomplete="username" required />
	<Input label="Password" name="password" type="password" autocomplete="current-password" required />

	<Button type="submit" variant="primary">Log in</Button>
</form>
