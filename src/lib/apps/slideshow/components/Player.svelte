<script lang="ts">
	import { onMount } from 'svelte';

	type PlayerPhoto = { id: string; contributorName: string | null };

	let {
		photos,
		youtubeId = null,
		slideDurationMs = 5000,
		transition = 'kenburns'
	}: {
		photos: PlayerPhoto[];
		youtubeId?: string | null;
		slideDurationMs?: number;
		transition?: 'fade' | 'kenburns';
	} = $props();

	let current = $state(0);
	let playing = $state(true);
	let needsSoundTap = $state(false);
	let container: HTMLElement | undefined = $state();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let ytPlayer: any = null;
	let ytReady = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;

	const currentPhoto = $derived(photos[current]);

	function next() {
		current = (current + 1) % photos.length;
	}
	function prev() {
		current = (current - 1 + photos.length) % photos.length;
	}
	function goTo(i: number) {
		current = i;
	}

	function startTimer() {
		stopTimer();
		timer = setInterval(next, slideDurationMs);
	}
	function stopTimer() {
		if (timer) clearInterval(timer);
		timer = undefined;
	}

	function togglePlay() {
		playing = !playing;
		if (playing) {
			startTimer();
			ytPlayer?.playVideo?.();
		} else {
			stopTimer();
			ytPlayer?.pauseVideo?.();
		}
	}

	function enableSound() {
		needsSoundTap = false;
		ytPlayer?.unMute?.();
		ytPlayer?.playVideo?.();
	}

	function toggleFullscreen() {
		if (document.fullscreenElement) document.exitFullscreen();
		else container?.requestFullscreen?.();
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === ' ') {
			e.preventDefault();
			togglePlay();
		} else if (e.key === 'ArrowRight') next();
		else if (e.key === 'ArrowLeft') prev();
		else if (e.key === 'f') toggleFullscreen();
	}

	onMount(() => {
		if (photos.length > 1 && playing) startTimer();

		if (youtubeId) {
			// Load the official YouTube IFrame API and attach a hidden player.
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const w = window as any;
			const create = () => {
				ytPlayer = new w.YT.Player('slideshow-yt-audio', {
					videoId: youtubeId,
					playerVars: { autoplay: 1, loop: 1, playlist: youtubeId, controls: 0 },
					events: {
						onReady: () => {
							ytReady = true;
							// Browsers block unmuted autoplay; start muted and offer a tap-in.
							ytPlayer.mute();
							ytPlayer.playVideo();
							needsSoundTap = true;
						}
					}
				});
			};
			if (w.YT?.Player) {
				create();
			} else {
				const prevCb = w.onYouTubeIframeAPIReady;
				w.onYouTubeIframeAPIReady = () => {
					prevCb?.();
					create();
				};
				if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
					const tag = document.createElement('script');
					tag.src = 'https://www.youtube.com/iframe_api';
					document.head.appendChild(tag);
				}
			}
		}

		return () => {
			stopTimer();
			ytPlayer?.destroy?.();
		};
	});
</script>

<svelte:window onkeydown={onKeydown} />

<div bind:this={container} class="relative h-full w-full overflow-hidden bg-black">
	{#if photos.length === 0}
		<div class="flex h-full items-center justify-center text-white/60">No photos yet.</div>
	{:else}
		{#each photos as photo, i (photo.id)}
			<div
				class="absolute inset-0 transition-opacity duration-1000 {i === current
					? 'opacity-100'
					: 'opacity-0'}"
			>
				<img
					src={`/apps/slideshow/api/image/${photo.id}/original`}
					alt=""
					class="h-full w-full object-contain {transition === 'kenburns' && i === current
						? 'kenburns'
						: ''}"
					style={transition === 'kenburns' ? `animation-duration: ${slideDurationMs + 2000}ms` : ''}
					loading={Math.abs(i - current) <= 1 || (current === 0 && i === photos.length - 1)
						? 'eager'
						: 'lazy'}
				/>
			</div>
		{/each}

		{#if currentPhoto?.contributorName}
			<p class="absolute bottom-16 left-4 rounded bg-black/50 px-2 py-1 text-xs text-white/80">
				📷 {currentPhoto.contributorName}
			</p>
		{/if}

		<!-- Hidden YouTube audio player -->
		{#if youtubeId}
			<div class="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden">
				<div id="slideshow-yt-audio"></div>
			</div>
		{/if}

		{#if needsSoundTap && ytReady}
			<button
				onclick={enableSound}
				class="absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm text-white hover:bg-black/90"
			>
				🔊 Tap for sound
			</button>
		{/if}

		<!-- Controls -->
		<div class="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent p-4">
			<div class="flex items-center gap-2">
				<button onclick={prev} class="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Previous">⏮</button>
				<button onclick={togglePlay} class="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label={playing ? 'Pause' : 'Play'}>
					{playing ? '⏸' : '▶️'}
				</button>
				<button onclick={next} class="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Next">⏭</button>
			</div>

			{#if photos.length <= 20}
				<div class="flex flex-wrap items-center justify-center gap-1.5">
					{#each photos as photo, i (photo.id)}
						<button
							onclick={() => goTo(i)}
							class="h-2 w-2 rounded-full {i === current ? 'bg-white' : 'bg-white/30 hover:bg-white/60'}"
							aria-label={`Go to photo ${i + 1}`}
						></button>
					{/each}
				</div>
			{:else}
				<span class="text-xs text-white/70">{current + 1} / {photos.length}</span>
			{/if}

			<button onclick={toggleFullscreen} class="rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Fullscreen">⛶</button>
		</div>
	{/if}
</div>

<style>
	@keyframes kenburns {
		from {
			transform: scale(1) translate(0, 0);
		}
		to {
			transform: scale(1.08) translate(-1%, 1%);
		}
	}
	.kenburns {
		animation-name: kenburns;
		animation-timing-function: ease-out;
		animation-fill-mode: forwards;
	}
</style>
