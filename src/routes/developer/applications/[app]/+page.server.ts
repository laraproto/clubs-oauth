import { auth } from '#lib/server/auth';
import type { PageServerLoad } from './$types';

export const load = (async ({ params, request }) => {
	return {
		app: await auth.api.getOAuthClient({
			query: {
				client_id: params.app
			},
			headers: request.headers
		})
	};
}) satisfies PageServerLoad;
