import { query, getRequestEvent } from '$app/server';
import { auth } from '#lib/server/auth';

export const getOrganizations = query(async () => {
	const event = getRequestEvent();

	return await auth.api.listOrganizations({
		headers: event.request.headers
	});
});
