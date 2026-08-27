import { fail, redirect } from '@sveltejs/kit';
import {
	createSlideshow,
	isSlugTaken,
	isValidSlug,
	listSlideshowsForOwner
} from '$lib/apps/slideshow/server';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.slideshow.user) return { slideshows: null };
	return { slideshows: await listSlideshowsForOwner(locals.slideshow.user.id) };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const user = locals.slideshow.user;
		if (!user) throw redirect(302, '/apps/slideshow/login');

		const form = await request.formData();
		const title = String(form.get('title') ?? '').trim();
		const slug = String(form.get('slug') ?? '')
			.trim()
			.toLowerCase();

		if (!title || title.length > 100) {
			return fail(400, { title, slug, error: 'Title is required (max 100 characters).' });
		}
		if (!isValidSlug(slug)) {
			return fail(400, {
				title,
				slug,
				error: 'Link name must be 3-50 characters: lowercase letters, numbers, hyphens.'
			});
		}
		if (await isSlugTaken(slug)) {
			return fail(400, { title, slug, error: 'That link name is already taken.' });
		}

		const id = await createSlideshow(user.id, title, slug);
		throw redirect(303, `/apps/slideshow/edit/${id}`);
	}
};
