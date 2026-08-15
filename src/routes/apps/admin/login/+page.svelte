<script lang="ts">
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<h1 class="mb-6 text-2xl font-semibold text-white">Admin Login</h1>

<form method="POST" class="flex max-w-sm flex-col gap-4">
	{#if form?.error}
		<p class="rounded border border-red-800 bg-red-950 px-3 py-2 text-sm text-red-300">
			{form.error}
		</p>
	{/if}

	<label class="flex flex-col gap-1 text-sm text-neutral-300">
		Username
		<input
			name="username"
			type="text"
			autocomplete="username"
			required
			class="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
		/>
	</label>

	<label class="flex flex-col gap-1 text-sm text-neutral-300">
		Password
		<input
			name="password"
			type="password"
			autocomplete="current-password"
			required
			class="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white"
		/>
	</label>

	<button type="submit" class="rounded-lg bg-white px-4 py-2 font-medium text-neutral-900 hover:bg-neutral-200">
		Log in
	</button>
</form>
