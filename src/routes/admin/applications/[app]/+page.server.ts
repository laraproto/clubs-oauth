import { getApp } from '../../data.remote';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	return {
		app: await getApp(params.app)
	};
}) satisfies PageServerLoad;
