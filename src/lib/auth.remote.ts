import { command, getRequestEvent } from '$app/server';
import { auth } from '#lib/server/auth';
import { z } from 'zod';
import { APIError } from 'better-auth/api';
import { error } from '@sveltejs/kit';

export const signout = command(async () => {
	const event = getRequestEvent();
	await auth.api.signOut({
		headers: event.request.headers
	});
});

export const authConsent = command(z.object({ consent: z.boolean() }), async (data) => {
	const event = getRequestEvent();
	try {
		const result = await auth.api.oauth2Consent({
			body: {
				accept: data.consent,
				oauth_query: event.url.searchParams.toString()
			},
			headers: event.request.headers
		});
		return result;
	} catch (err) {
		if (err instanceof APIError) {
			console.error(err);
			return error(500, err.body?.error);
		}
		console.error(err);
	}
});

export const setActiveOrganization = command(z.string(), async (app) => {
	const event = getRequestEvent();

	try {
		await auth.api.setActiveOrganization({
			body: {
				organizationId: app
			},
			headers: event.request.headers
		});
	} catch (err) {
		if (err instanceof APIError) {
			console.error(err);
			return error(500, err.body?.error);
		}
		console.error(err);
	}
});
