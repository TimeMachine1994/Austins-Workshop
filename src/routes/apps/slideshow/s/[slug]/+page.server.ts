import { error, fail } from '@sveltejs/kit';
import {
	addPhoto,
	countPhotos,
	extractYouTubeId,
	getSlideshowBySlug,
	listPhotos,
	parseSettings
} from '$lib/apps/slideshow/server';
import {
	MAX_PHOTOS_PER_GUEST_SUBMISSION,
	MAX_PHOTOS_PER_SLIDESHOW,
	MAX_UPLOAD_BYTES,
	isAllowedImageType,
	saveImage
} from '$lib/apps/slideshow/storage/images';
import type { Actions, PageServerLoad } from './$types';

/** Naive in-memory per-IP rate limit for guest submissions: 3 submissions / 10 min. */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 3;
const submissionLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
	const now = Date.now();
	const recent = (submissionLog.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
	if (recent.length >= RATE_MAX) {
		submissionLog.set(ip, recent);
		return true;
	}
	recent.push(now);
	submissionLog.set(ip, recent);
	return false;
}

export const load: PageServerLoad = async ({ params, locals }) => {
	const slideshow = await getSlideshowBySlug(params.slug);
	if (!slideshow) throw error(404, 'Slideshow not found');

	const approved = await listPhotos(slideshow.id, 'approved');
	const settings = parseSettings(slideshow.settings);

	return {
		slideshow: {
			title: slideshow.title,
			slug: slideshow.slug,
			youtubeId: slideshow.musicUrl ? extractYouTubeId(slideshow.musicUrl) : null,
			settings
		},
		photos: approved.map(({ id, contributorName }) => ({ id, contributorName })),
		isOwner: locals.slideshow.user?.id === slideshow.ownerId
	};
};

export const actions: Actions = {
	submit: async ({ params, request, getClientAddress }) => {
		const slideshow = await getSlideshowBySlug(params.slug);
		if (!slideshow) throw error(404, 'Slideshow not found');

		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);

		if (!name || name.length > 50) {
			return fail(400, { name, error: 'Please tell us your name (max 50 characters).' });
		}
		if (files.length === 0) {
			return fail(400, { name, error: 'Choose at least one photo.' });
		}
		if (files.length > MAX_PHOTOS_PER_GUEST_SUBMISSION) {
			return fail(400, { name, error: `You can submit up to ${MAX_PHOTOS_PER_GUEST_SUBMISSION} photos at a time.` });
		}
		for (const file of files) {
			if (!isAllowedImageType(file.type)) {
				return fail(400, { name, error: `"${file.name}" is not a supported image (JPEG, PNG, or WebP).` });
			}
			if (file.size > MAX_UPLOAD_BYTES) {
				return fail(400, { name, error: `"${file.name}" is larger than 10 MB.` });
			}
		}

		const existing = await countPhotos(slideshow.id);
		if (existing + files.length > MAX_PHOTOS_PER_SLIDESHOW) {
			return fail(400, { name, error: 'This slideshow is full — it cannot accept more photos.' });
		}

		if (isRateLimited(getClientAddress())) {
			return fail(429, { name, error: 'Too many submissions — please wait a few minutes and try again.' });
		}

		for (const file of files) {
			const image = await saveImage(slideshow.id, Buffer.from(await file.arrayBuffer()));
			await addPhoto(slideshow.id, image, { contributorName: name, status: 'pending' });
		}

		return { submitted: files.length };
	}
};
