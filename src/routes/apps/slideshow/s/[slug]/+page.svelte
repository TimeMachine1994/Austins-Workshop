<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Input } from '$lib/ui';
	import Player from '$lib/apps/slideshow/components/Player.svelte';
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();

	let showSubmit = $state(false);
	let submitting = $state(false);
</script>

<svelte:head>
	<title>{data.slideshow.title} — Slideshow</title>
	<meta property="og:title" content={data.slideshow.title} />
	<meta property="og:description" content="Watch this photo slideshow — and add your own photos." />
	{#if data.photos.length > 0}
		<meta property="og:image" content={`/apps/slideshow/api/image/${data.photos[0].id}/thumb`} />
	{/if}
</svelte:head>

<div class="flex h-[calc(100vh-8rem)] min-h-[24rem] flex-col">
	<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-xl font-semibold text-ink">{data.slideshow.title}</h1>
		<div class="flex items-center gap-2">
			{#if data.isOwner}
				<Button href="/apps/slideshow" variant="secondary" size="sm">My slideshows</Button>
			{/if}
			<Button variant="primary" size="sm" onclick={() => (showSubmit = !showSubmit)}>
				{showSubmit ? 'Close' : '📷 Add your photos'}
			</Button>
		</div>
	</div>

	{#if showSubmit}
		<div class="mb-4 rounded-xl border border-edge bg-panel p-4">
			{#if form?.submitted}
				<p class="text-sm text-ink">
					🎉 Thanks! Your {form.submitted === 1 ? 'photo has' : `${form.submitted} photos have`} been sent
					to the owner for approval.
				</p>
			{:else}
				<form
					method="POST"
					action="?/submit"
					enctype="multipart/form-data"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							submitting = false;
							await update();
						};
					}}
					class="flex flex-wrap items-end gap-3"
				>
					{#if form?.error}
						<p class="w-full rounded-lg border border-danger-edge bg-danger-panel px-3 py-2 text-sm text-danger">
							{form.error}
						</p>
					{/if}
					<Input label="Your name" name="name" type="text" value={form?.name ?? ''} required class="min-w-40" />
					<label class="flex flex-col gap-1 text-sm text-ink-muted">
						Photos (up to 10)
						<input
							type="file"
							name="photos"
							accept="image/jpeg,image/png,image/webp"
							multiple
							required
							class="text-sm text-ink-muted file:mr-3 file:rounded-lg file:border file:border-edge file:bg-panel file:px-3 file:py-1.5 file:text-sm file:text-ink"
						/>
					</label>
					<Button type="submit" variant="primary" size="sm" disabled={submitting}>
						{submitting ? 'Sending…' : 'Submit for approval'}
					</Button>
				</form>
			{/if}
		</div>
	{/if}

	<div class="min-h-0 flex-1 overflow-hidden rounded-xl border border-edge">
		<Player
			photos={data.photos}
			youtubeId={data.slideshow.youtubeId}
			slideDurationMs={data.slideshow.settings.slideDurationMs}
			transition={data.slideshow.settings.transition}
		/>
	</div>

	<p class="mt-2 text-center text-xs text-ink-muted">
		Space to play/pause · arrow keys to navigate · F for fullscreen
	</p>
</div>
