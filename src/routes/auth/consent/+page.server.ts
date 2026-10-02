import type { OAuthClient } from '@better-auth/oauth-provider';
import type { PageServerLoad } from './$types';
import { auth } from '#lib/server/auth';
import { APIError } from 'better-auth/api';

export const load = (async ({ request, url }) => {
	let oauthClient: OAuthClient | null = null;

	if (url.searchParams.has('client_id')) {
		try {
			oauthClient = await auth.api.getOAuthClientPublic({
				headers: request.headers,
				query: {
					client_id: url.searchParams.get('client_id')!
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

	return {
		oauthClient
	};
}) satisfies PageServerLoad;
