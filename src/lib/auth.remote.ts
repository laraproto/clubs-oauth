import { command, getRequestEvent } from '$app/server';
import { auth } from '#lib/server/auth';

export const signout = command(async () => {
	const event = getRequestEvent();
	await auth.api.signOut({
		headers: event.request.headers
	});
});
