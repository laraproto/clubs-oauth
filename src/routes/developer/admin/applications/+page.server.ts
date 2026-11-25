import type { PageServerLoad } from './$types';

import { getApps } from '../data.remote';

export const load = (async () => {
	return {
		applications: await getApps()
	};
}) satisfies PageServerLoad;
