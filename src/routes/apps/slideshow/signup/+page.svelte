<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input } from '$lib/ui';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Slideshows — Sign up</title></svelte:head>

<h1 class="mb-6 text-2xl font-semibold text-ink">Sign up</h1>

<form method="POST" use:enhance class="flex max-w-sm flex-col gap-4">
	{#if form?.error}
		<p class="rounded-lg border border-danger-edge bg-danger-panel px-3 py-2 text-sm text-danger">
			{form.error}
		</p>
	{/if}

	<Input
		label="Username"
		name="username"
		type="text"
		autocomplete="username"
		value={form?.username ?? ''}
		required
	/>
	<Input label="Password" name="password" type="password" autocomplete="new-password" required />
	<Input label="Confirm password" name="confirm" type="password" autocomplete="new-password" required />

	<Button type="submit" variant="primary">Create account</Button>

	<p class="text-sm text-ink-muted">
		Already have an account?
		<a href="/apps/slideshow/login" class="text-accent hover:underline">Log in</a>
	</p>
</form>
