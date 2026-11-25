import type { PageServerLoad } from './$types';
import { auth } from '#lib/server/auth';

export const load = (async ({ request }) => {
	return {
		applications: await auth.api.getOAuthClients({
			headers: request.headers
		})
	};
}) satisfies PageServerLoad;