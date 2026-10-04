import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ parent }) => {
	const { oauthClient } = await parent();

	if (!oauthClient) {
		return redirect(303, '/auth/signin');
	}

	return {};
}) satisfies PageServerLoad;
