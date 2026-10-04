import type { RequestHandler } from './$types';
import { redirect } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ locals }) => {
	if (locals.session || locals.user) {
		return redirect(302, '/user');
	}

	return redirect(302, '/auth/signin');
};
