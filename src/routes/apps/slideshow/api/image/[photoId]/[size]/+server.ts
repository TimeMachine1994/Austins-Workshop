import { error } from '@sveltejs/kit';
import { getPhotoById, getSlideshowById } from '$lib/apps/slideshow/server';
import { resolveImagePath, imageStream } from '$lib/apps/slideshow/storage/images';
import type { RequestHandler } from './$types';

/**
 * Streams a stored photo (original or thumbnail).
 * Approved photos are public (share pages need them without auth);
 * pending photos are only visible to the slideshow's owner.
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	const { photoId, size } = params;
	if (size !== 'original' && size !== 'thumb') throw error(404, 'Not found');

	const photo = await getPhotoById(photoId);
	if (!photo) throw error(404, 'Not found');

	if (photo.status !== 'approved') {
		const slideshow = await getSlideshowById(photo.slideshowId);
		if (!slideshow || locals.slideshow.user?.id !== slideshow.ownerId) {
			throw error(404, 'Not found');
		}
	}

	const rel = size === 'original' ? photo.originalPath : photo.thumbPath;
	const abs = resolveImagePath(rel);
	if (!abs) throw error(404, 'Not found');

	return new Response(imageStream(abs) as unknown as BodyInit, {
		headers: {
			'Content-Type': 'image/webp',
			'Cache-Control': photo.status === 'approved' ? 'public, max-age=31536000, immutable' : 'private, no-cache'
		}
	});
};
