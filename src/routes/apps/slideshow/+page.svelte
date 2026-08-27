<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button, Card, Input } from '$lib/ui';
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();

	let showCreate = $state(false);
	$effect(() => {
		if (form?.error) showCreate = true;
	});

	function formatDate(ms: number): string {
		return new Date(ms).toLocaleDateString();
	}
</script>

<svelte:head><title>Slideshows</title></svelte:head>

{#if data.slideshows === null}
	<div class="mx-auto max-w-xl py-12 text-center">
		<div class="mb-4 text-5xl">🎞️</div>
		<h1 class="mb-3 text-3xl font-semibold text-ink">Photo slideshows, together</h1>
		<p class="mb-8 text-ink-muted">
			Upload photos, pick a soundtrack from YouTube, and share your slideshow with a custom link.
			Friends can watch — and submit their own photos for you to approve.
		</p>
		<div class="flex justify-center gap-3">
			<Button href="/apps/slideshow/signup" variant="primary">Get started</Button>
			<Button href="/apps/slideshow/login" variant="secondary">Log in</Button>
		</div>
	</div>
{:else}
	<div class="mb-6 flex items-center justify-between">
		<h1 class="text-2xl font-semibold text-ink">My slideshows</h1>
		<Button variant="primary" onclick={() => (showCreate = !showCreate)}>
			{showCreate ? 'Cancel' : 'New slideshow'}
		</Button>
	</div>

	{#if showCreate}
		<Card class="mb-6">
			<form method="POST" action="?/create" use:enhance class="flex max-w-md flex-col gap-4">
				{#if form?.error}
					<p class="rounded-lg border border-danger-edge bg-danger-panel px-3 py-2 text-sm text-danger">
						{form.error}
					</p>
				{/if}
				<Input label="Title" name="title" type="text" value={form?.title ?? ''} required />
				<div>
					<Input
						label="Custom link name"
						name="slug"
						type="text"
						value={form?.slug ?? ''}
						placeholder="summer-trip-2026"
						required
					/>
					<p class="mt-1 text-xs text-ink-muted">
						Your share link: /apps/slideshow/s/<span class="text-ink">your-link-name</span>
					</p>
				</div>
				<Button type="submit" variant="primary">Create</Button>
			</form>
		</Card>
	{/if}

	{#if data.slideshows.length === 0}
		<p class="py-12 text-center text-ink-muted">
			No slideshows yet — create your first one to start uploading photos.
		</p>
	{:else}
		<ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.slideshows as show (show.id)}
				<li>
					<Card>
						<div class="flex h-full flex-col gap-2">
							<div class="flex items-start justify-between gap-2">
								<h2 class="font-semibold text-ink">{show.title}</h2>
								{#if show.pendingCount > 0}
									<span class="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-on-accent">
										{show.pendingCount} pending
									</span>
								{/if}
							</div>
							<p class="text-sm text-ink-muted">
								{show.photoCount}
								{show.photoCount === 1 ? 'photo' : 'photos'}
								{#if show.musicUrl}· 🎵 music set{/if}
								· created {formatDate(show.createdAt)}
							</p>
							<div class="mt-auto flex gap-2 pt-2">
								<Button href={`/apps/slideshow/edit/${show.id}`} variant="secondary" size="sm">Edit</Button>
								<Button href={`/apps/slideshow/s/${show.slug}`} variant="secondary" size="sm">View</Button>
							</div>
						</div>
					</Card>
				</li>
			{/each}
		</ul>
	{/if}
{/if}
