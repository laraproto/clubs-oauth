import { SIDEBAR_COOKIE_NAME } from '#lib/components/ui/sidebar/constants';
import { auth } from '#lib/server/auth';
import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ locals, cookies }) => {
	if (!locals.user) {
		const result = await auth.api.signInSocial({
			body: {
				provider: 'hackclub',
				callbackURL: '/admin'
			}
		});
		if (result.url) {
			return redirect(302, result.url, { external: true });
		} else {
			redirect(302, '/');
		}
	}

	if ((locals.user as typeof locals.user & { role?: string }).role !== 'admin') {
		redirect(302, '/');
	}

	return {
		user: locals.user,
		sidebarOpen: cookies.get(SIDEBAR_COOKIE_NAME) === 'true'
	};
}) satisfies LayoutServerLoad;
