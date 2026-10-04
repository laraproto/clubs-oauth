import type { OAuthClient } from '@better-auth/oauth-provider';
import type { LayoutServerLoad } from './$types';
import { auth } from '#lib/server/auth';
import { APIError } from 'better-auth';

export const load = (async ({ url, request }) => {
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

	return {
		oauthClient
	};
}) satisfies LayoutServerLoad;
