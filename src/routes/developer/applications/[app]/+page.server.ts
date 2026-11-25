import { auth } from '#lib/server/auth';
import { APIError } from 'better-auth';
import type { PageServerLoad } from './$types';
import { redirect } from 'sveltekit-flash-message/server';

export const load = (async ({ params, request, cookies }) => {
	let app: Awaited<ReturnType<typeof auth.api.getOAuthClient>> | null = null;
	try {
		app = await auth.api.getOAuthClient({
			query: {
				client_id: params.app
			},
			headers: request.headers
		});
	} catch (err) {
		if (err instanceof APIError) {
			return redirect(
				303,
				'/developer/applications',
				{
					type: 'error',
					message: err.message.length > 0 ? err.message : 'Application not found'
				},
				cookies
			);
		}
	}

	return {
		app
	};
}) satisfies PageServerLoad;
