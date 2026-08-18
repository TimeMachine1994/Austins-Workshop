<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input } from '$lib/ui';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Screenwriter — Sign up</title></svelte:head>

<h1 class="mb-1 text-2xl font-semibold text-ink">Create an account</h1>
<p class="mb-6 text-sm text-ink-muted">
	Save screenplays privately online, with JSON and ZIP backups. Share your login with a
	co-writer to work on the same scripts.
</p>

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

	<Button type="submit" variant="primary">Sign up</Button>

	<p class="text-sm text-ink-muted">
		Already have an account?
		<a href="/apps/screenwriter/login" class="text-accent hover:underline">Log in</a>
	</p>
</form>
