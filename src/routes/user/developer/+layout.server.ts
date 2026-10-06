import type { LayoutServerLoad } from './$types';
import { auth } from '#lib/server/auth';
import { redirect } from 'sveltekit-flash-message/server';

export const load = (async ({ request, cookies }) => {
	const oauthClients = await auth.api.getOAuthClients({
		headers: request.headers
	});

	if (!oauthClients || oauthClients.length === 0) {
		return redirect(
			302,
			'/user',
			{
				type: 'error',
				message:
					'Developer pages cannot be accessed without OAuth clients, please reach out to get a client made.'
			},
			cookies
		);
	}

	return {};
}) satisfies LayoutServerLoad;
