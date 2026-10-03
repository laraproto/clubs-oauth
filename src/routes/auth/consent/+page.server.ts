import type { OAuthClient } from '@better-auth/oauth-provider';
import type { PageServerLoad } from './$types';
import { auth } from '#lib/server/auth';
import { APIError } from 'better-auth/api';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ request, url }) => {
	let oauthClient: OAuthClient | null = null;

	if (url.searchParams.has('client_id')) {
		try {
			oauthClient = await auth.api.getOAuthClientPublicPrelogin({
				headers: request.headers,
				body: {
					client_id: url.searchParams.get('client_id')!,
					oauth_query: url.searchParams.toString()
				}
			});
		} catch (err) {
			if (err instanceof APIError) {
				console.error(err);
			} else if (err instanceof Error) {
				throw err;
			}
		}
	}

	if (!oauthClient) {
		return redirect(303, '/auth/signin');
	}

	return {
		oauthClient
	};
}) satisfies PageServerLoad;
