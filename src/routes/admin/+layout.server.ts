import { SIDEBAR_COOKIE_NAME } from '#lib/components/ui/sidebar/constants';
import { auth } from '#lib/server/auth';
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, request, cookies }) => {
	if (!locals.user) {
		const result = await auth.api.signInSocial({
			body: {
				provider: 'hackclub',
				callbackURL: '/admin'
			},
			headers: request.headers
		});
		if (result.url) {
			return redirect(302, result.url, { external: true });
		} else {
			return redirect(302, '/');
		}
	}

	if (locals.user.role !== 'admin') {
		return redirect(302, '/');
	}

	const cookie = cookies.get(SIDEBAR_COOKIE_NAME);

	return {
		user: locals.user,

		sidebarOpen: cookie ? cookie === 'true' : true
	};
}) satisfies LayoutServerLoad;
