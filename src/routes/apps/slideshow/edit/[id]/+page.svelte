<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { Button, Card, Input } from '$lib/ui';
	import type { ActionData, PageProps } from './$types';

	let { data, form }: PageProps & { form: ActionData } = $props();

	let uploading = $state(false);
	let copied = $state(false);
	let confirmingDelete = $state(false);
	let dragIndex: number | null = $state(null);

	const shareUrl = $derived(`${page.url.origin}/apps/slideshow/s/${data.slideshow.slug}`);

	async function copyLink() {
		await navigator.clipboard.writeText(shareUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	// Drag-and-drop reorder: submits the full order to the reorder action on drop.
	let orderInput: HTMLInputElement | undefined = $state();
	let orderForm: HTMLFormElement | undefined = $state();

	function onDrop(targetIndex: number) {
		if (dragIndex === null || dragIndex === targetIndex) {
			dragIndex = null;
			return;
		}
		const ids = data.photos.map((p) => p.id);
		const [moved] = ids.splice(dragIndex, 1);
		ids.splice(targetIndex, 0, moved);
		dragIndex = null;
		if (orderInput && orderForm) {
			orderInput.value = ids.join(',');
			orderForm.requestSubmit();
		}
	}
</script>

<svelte:head><title>Edit — {data.slideshow.title}</title></svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-semibold text-ink">{data.slideshow.title}</h1>
	<div class="flex items-center gap-2">
		<Button variant="secondary" size="sm" onclick={copyLink}>
			{copied ? 'Copied!' : 'Copy share link'}
		</Button>
		<Button href={shareUrl} variant="primary" size="sm">View slideshow</Button>
	</div>
</div>

{#if form?.error}
	<p class="mb-4 rounded-lg border border-danger-edge bg-danger-panel px-3 py-2 text-sm text-danger">
		{form.error}
	</p>
{/if}

<div class="grid gap-6 lg:grid-cols-3">
	<div class="lg:col-span-2 flex flex-col gap-6">
		<!-- Upload -->
		<Card>
			<h2 class="mb-3 font-semibold text-ink">Add photos</h2>
			<form
				method="POST"
				action="?/upload"
				enctype="multipart/form-data"
				use:enhance={() => {
					uploading = true;
					return async ({ update }) => {
						uploading = false;
						await update();
					};
				}}
				class="flex flex-wrap items-center gap-3"
			>
				<input
					type="file"
					name="photos"
					accept="image/jpeg,image/png,image/webp"
					multiple
					required
					class="text-sm text-ink-muted file:mr-3 file:rounded-lg file:border file:border-edge file:bg-panel file:px-3 file:py-1.5 file:text-sm file:text-ink"
				/>
				<Button type="submit" variant="primary" size="sm" disabled={uploading}>
					{uploading ? 'Uploading…' : 'Upload'}
				</Button>
			</form>
			<p class="mt-2 text-xs text-ink-muted">JPEG, PNG, or WebP · up to 10 MB each · max 100 photos</p>
		</Card>

		<!-- Pending queue -->
		{#if data.pending.length > 0}
			<Card>
				<h2 class="mb-3 font-semibold text-ink">
					Pending submissions
					<span class="ml-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-on-accent">
						{data.pending.length}
					</span>
				</h2>
				<ul class="grid gap-4 sm:grid-cols-2">
					{#each data.pending as photo (photo.id)}
						<li class="rounded-lg border border-edge p-3">
							<img
								src={`/apps/slideshow/api/image/${photo.id}/thumb`}
								alt="Pending submission"
								class="mb-2 h-40 w-full rounded object-cover"
							/>
							<p class="mb-2 text-sm text-ink-muted">
								From <span class="text-ink">{photo.contributorName ?? 'Anonymous'}</span>
							</p>
							<div class="flex gap-2">
								<form method="POST" action="?/moderate" use:enhance>
									<input type="hidden" name="photoId" value={photo.id} />
									<input type="hidden" name="decision" value="approve" />
									<Button type="submit" variant="primary" size="sm">Approve</Button>
								</form>
								<form method="POST" action="?/moderate" use:enhance>
									<input type="hidden" name="photoId" value={photo.id} />
									<input type="hidden" name="decision" value="reject" />
									<Button type="submit" variant="danger" size="sm">Reject</Button>
								</form>
							</div>
						</li>
					{/each}
				</ul>
			</Card>
		{/if}

		<!-- Photo grid -->
		<Card>
			<h2 class="mb-3 font-semibold text-ink">
				Photos <span class="text-sm font-normal text-ink-muted">({data.photos.length}) — drag to reorder</span>
			</h2>
			<form method="POST" action="?/reorder" use:enhance bind:this={orderForm} class="hidden">
				<input type="hidden" name="order" bind:this={orderInput} />
			</form>
			{#if data.photos.length === 0}
				<p class="py-8 text-center text-sm text-ink-muted">No photos yet — upload some above.</p>
			{:else}
				<ul class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
					{#each data.photos as photo, i (photo.id)}
						<li
							draggable="true"
							ondragstart={() => (dragIndex = i)}
							ondragover={(e) => e.preventDefault()}
							ondrop={() => onDrop(i)}
							class="group relative cursor-grab rounded-lg border border-edge {dragIndex === i
								? 'opacity-50'
								: ''}"
						>
							<img
								src={`/apps/slideshow/api/image/${photo.id}/thumb`}
								alt="Slideshow item {i + 1}"
								class="h-32 w-full rounded-lg object-cover"
							/>
							{#if photo.contributorName}
								<span
									class="absolute bottom-1 left-1 rounded bg-surface/80 px-1.5 py-0.5 text-xs text-ink"
									title="Contributed by {photo.contributorName}"
								>
									👤 {photo.contributorName}
								</span>
							{/if}
							<form method="POST" action="?/deletePhoto" use:enhance class="absolute right-1 top-1 opacity-0 group-hover:opacity-100">
								<input type="hidden" name="photoId" value={photo.id} />
								<Button type="submit" variant="danger" size="sm" aria-label="Delete photo">✕</Button>
							</form>
						</li>
					{/each}
				</ul>
			{/if}
		</Card>
	</div>

	<!-- Settings -->
	<div class="flex flex-col gap-6">
		<Card>
			<h2 class="mb-3 font-semibold text-ink">Settings</h2>
			<form method="POST" action="?/settings" use:enhance={() => async ({ update }) => {
				await update({ reset: false });
				await invalidateAll();
			}} class="flex flex-col gap-4">
				<Input label="Title" name="title" type="text" value={data.slideshow.title} required />
				<div>
					<Input
						label="Music (YouTube link)"
						name="musicUrl"
						type="url"
						value={data.slideshow.musicUrl ?? ''}
						placeholder="https://www.youtube.com/watch?v=…"
					/>
					<p class="mt-1 text-xs text-ink-muted">
						Played via the official YouTube player while the slideshow runs. Leave blank for silence.
					</p>
				</div>
				<label class="flex flex-col gap-1 text-sm text-ink-muted">
					Seconds per slide
					<select
						name="slideDurationMs"
						value={String(data.slideshow.settings.slideDurationMs)}
						class="rounded-lg border border-edge bg-panel px-3 py-2 text-ink focus:border-edge-strong focus:outline-none"
					>
						{#each [3, 5, 7, 10, 15] as sec (sec)}
							<option value={String(sec * 1000)}>{sec} seconds</option>
						{/each}
					</select>
				</label>
				<label class="flex flex-col gap-1 text-sm text-ink-muted">
					Transition
					<select
						name="transition"
						value={data.slideshow.settings.transition}
						class="rounded-lg border border-edge bg-panel px-3 py-2 text-ink focus:border-edge-strong focus:outline-none"
					>
						<option value="kenburns">Ken Burns (pan &amp; zoom)</option>
						<option value="fade">Crossfade</option>
					</select>
				</label>
				<Button type="submit" variant="primary">Save settings</Button>
			</form>
		</Card>

		<Card>
			<h2 class="mb-3 font-semibold text-ink">Share</h2>
			<p class="mb-2 break-all rounded-lg border border-edge bg-panel px-3 py-2 text-sm text-ink">{shareUrl}</p>
			<p class="text-xs text-ink-muted">
				Anyone with this link can watch the slideshow and submit photos for your approval.
			</p>
		</Card>

		<Card>
			<h2 class="mb-3 font-semibold text-danger">Danger zone</h2>
			{#if confirmingDelete}
				<p class="mb-3 text-sm text-ink-muted">Delete this slideshow and all its photos? This cannot be undone.</p>
				<div class="flex gap-2">
					<form method="POST" action="?/deleteSlideshow" use:enhance>
						<Button type="submit" variant="danger" size="sm">Yes, delete everything</Button>
					</form>
					<Button variant="secondary" size="sm" onclick={() => (confirmingDelete = false)}>Cancel</Button>
				</div>
			{:else}
				<Button variant="danger" size="sm" onclick={() => (confirmingDelete = true)}>Delete slideshow</Button>
			{/if}
		</Card>
	</div>
</div>
