import { getApp } from '../../data.remote';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const app = await getApp(params.app);

	return {
		app
	};
}) satisfies PageServerLoad;
