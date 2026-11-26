import { SIDEBAR_COOKIE_NAME } from '#lib/components/ui/sidebar/constants';
import { auth } from '#lib/server/auth';
import { APIError } from 'better-auth/api';
import type { LayoutServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { OAuthClient } from '@better-auth/oauth-provider';
import type { Organization } from 'better-auth/plugins/organization';
import { resolve } from '$app/paths';

export const load = (async ({ locals, request, url, cookies }) => {
	if (!locals.user || !locals.session) {
		return redirect(303, resolve(`/auth/signin?return_to=${encodeURIComponent(url.pathname)}`));
	}

	const cookie = cookies.get(SIDEBAR_COOKIE_NAME);

	let oauthClients: OAuthClient[] | null = [];
	let organizations: Organization[] | null = [];

	try {
		const oauthClientResult = await auth.api.getOAuthClients({
			headers: request.headers
		});
		const organizationResult = await auth.api.listOrganizations({
			headers: request.headers
		});
		organizations = organizationResult;
		oauthClients = oauthClientResult;
	} catch (err) {
		if (err instanceof APIError) {
			if (err.statusCode !== 401) {
				return error(err.statusCode, err.message.length > 0 ? err.message : err.status.toString());
			}
		}
	}

	return {
		user: locals.user,
		session: locals.session,
		organizations,
		oauthClients,
		sidebarOpen: cookie ? cookie === 'true' : true
	};
}) satisfies LayoutServerLoad;
