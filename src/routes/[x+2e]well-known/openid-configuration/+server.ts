import type { RequestHandler } from './$types';
import { oauthProviderOpenIdConfigMetadata } from '@better-auth/oauth-provider';
import { auth } from '#lib/server/auth';

export const GET: RequestHandler = async ({ request }) => {
	return await oauthProviderOpenIdConfigMetadata(auth, {
		headers: request.headers
	})(request);
};
