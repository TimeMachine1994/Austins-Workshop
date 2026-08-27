import { error, fail, redirect } from '@sveltejs/kit';
import {
	countPhotos,
	deletePhoto,
	deleteSlideshow,
	extractYouTubeId,
	getSlideshowById,
	listPhotos,
	addPhoto,
	parseSettings,
	reorderPhotos,
	setPhotoStatus,
	updateSlideshow
} from '$lib/apps/slideshow/server';
import {
	MAX_PHOTOS_PER_SLIDESHOW,
	MAX_UPLOAD_BYTES,
	isAllowedImageType,
	saveImage
} from '$lib/apps/slideshow/storage/images';
import type { Actions, PageServerLoad } from './$types';

async function requireOwner(locals: App.Locals, id: string) {
	const user = locals.slideshow.user;
	if (!user) throw redirect(302, '/apps/slideshow/login');
	const slideshow = await getSlideshowById(id);
	if (!slideshow) throw error(404, 'Slideshow not found');
	if (slideshow.ownerId !== user.id) throw error(403, 'Not your slideshow');
	return slideshow;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const slideshow = await requireOwner(locals, params.id);
	const allPhotos = await listPhotos(slideshow.id);

	return {
		slideshow: {
			id: slideshow.id,
			slug: slideshow.slug,
			title: slideshow.title,
			musicUrl: slideshow.musicUrl,
			settings: parseSettings(slideshow.settings)
		},
		photos: allPhotos
			.filter((p) => p.status === 'approved')
			.map(({ id, position, contributorName, width, height }) => ({ id, position, contributorName, width, height })),
		pending: allPhotos
			.filter((p) => p.status === 'pending')
			.map(({ id, contributorName, createdAt }) => ({ id, contributorName, createdAt }))
	};
};

export const actions: Actions = {
	upload: async ({ locals, params, request }) => {
		const slideshow = await requireOwner(locals, params.id);
		const form = await request.formData();
		const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);

		if (files.length === 0) return fail(400, { error: 'Choose at least one photo.' });

		const existing = await countPhotos(slideshow.id);
		if (existing + files.length > MAX_PHOTOS_PER_SLIDESHOW) {
			return fail(400, { error: `A slideshow can hold at most ${MAX_PHOTOS_PER_SLIDESHOW} photos.` });
		}

		for (const file of files) {
			if (!isAllowedImageType(file.type)) {
				return fail(400, { error: `"${file.name}" is not a supported image (JPEG, PNG, or WebP).` });
			}
			if (file.size > MAX_UPLOAD_BYTES) {
				return fail(400, { error: `"${file.name}" is larger than 10 MB.` });
			}
		}

		for (const file of files) {
			const image = await saveImage(slideshow.id, Buffer.from(await file.arrayBuffer()));
			await addPhoto(slideshow.id, image, { contributorName: null, status: 'approved' });
		}
		await updateSlideshow(slideshow.id, {});
		return { success: true };
	},

	settings: async ({ locals, params, request }) => {
		const slideshow = await requireOwner(locals, params.id);
		const form = await request.formData();

		const title = String(form.get('title') ?? '').trim();
		const musicUrl = String(form.get('musicUrl') ?? '').trim();
		const slideDurationMs = Number(form.get('slideDurationMs') ?? 5000);
		const transition = String(form.get('transition') ?? 'kenburns');

		if (!title || title.length > 100) {
			return fail(400, { error: 'Title is required (max 100 characters).' });
		}
		if (musicUrl && !extractYouTubeId(musicUrl)) {
			return fail(400, { error: 'That does not look like a YouTube video link.' });
		}

		await updateSlideshow(slideshow.id, {
			title,
			musicUrl: musicUrl || null,
			settings: {
				slideDurationMs: Math.min(30000, Math.max(2000, slideDurationMs || 5000)),
				transition: transition === 'fade' ? 'fade' : 'kenburns'
			}
		});
		return { success: true };
	},

	reorder: async ({ locals, params, request }) => {
		const slideshow = await requireOwner(locals, params.id);
		const form = await request.formData();
		const order = String(form.get('order') ?? '')
			.split(',')
			.filter(Boolean);
		if (order.length > 0) await reorderPhotos(slideshow.id, order);
		return { success: true };
	},

	moderate: async ({ locals, params, request }) => {
		const slideshow = await requireOwner(locals, params.id);
		const form = await request.formData();
		const photoId = String(form.get('photoId') ?? '');
		const decision = String(form.get('decision') ?? '');

		const photo = (await listPhotos(slideshow.id)).find((p) => p.id === photoId);
		if (!photo) return fail(404, { error: 'Photo not found.' });
		if (decision !== 'approve' && decision !== 'reject') return fail(400, { error: 'Invalid decision.' });

		await setPhotoStatus(photoId, decision === 'approve' ? 'approved' : 'rejected');
		return { success: true };
	},

	deletePhoto: async ({ locals, params, request }) => {
		const slideshow = await requireOwner(locals, params.id);
		const form = await request.formData();
		const photoId = String(form.get('photoId') ?? '');
		const photo = (await listPhotos(slideshow.id)).find((p) => p.id === photoId);
		if (photo) await deletePhoto(photoId);
		return { success: true };
	},

	deleteSlideshow: async ({ locals, params }) => {
		const slideshow = await requireOwner(locals, params.id);
		await deleteSlideshow(slideshow.id);
		throw redirect(303, '/apps/slideshow');
	}
};
