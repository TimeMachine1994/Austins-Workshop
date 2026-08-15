import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const isLoginRoute = url.pathname === '/apps/admin/login';

	if (!locals.user && !isLoginRoute) {
		throw redirect(302, '/apps/admin/login');
	}

	if (locals.user && isLoginRoute) {
		throw redirect(302, '/apps/admin');
	}

	return { user: locals.user };
};
