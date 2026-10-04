import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	if (!locals.user || !locals.session) {
		return redirect(303, '/auth/signin');
	}

	return {
		user: locals.user
	};
}) satisfies LayoutServerLoad;
