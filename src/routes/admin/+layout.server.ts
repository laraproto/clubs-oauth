import { SIDEBAR_COOKIE_NAME } from '#lib/components/ui/sidebar/constants';
import { auth } from '#lib/server/auth';
import { APIError } from 'better-auth/api';
import type { LayoutServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { OAuthClient } from '@better-auth/oauth-provider';

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

	// eslint-disable-next-line no-useless-assignment
	let oauthClients: OAuthClient[] | null = [];

	try {
		const result = await auth.api.getOAuthClients({
			headers: request.headers
		});
		oauthClients = result;
	} catch (err) {
		if (err instanceof APIError) {
			return error(500, err.message);
		}
		throw err;
	}

	return {
		user: locals.user,
		oauthClients,
		sidebarOpen: cookie ? cookie === 'true' : true
	};
}) satisfies LayoutServerLoad;
