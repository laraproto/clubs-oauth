import { command, getRequestEvent } from '$app/server';
import { z } from 'zod';
import { APIError } from 'better-auth/api';
import { auth } from '#lib/server/auth';
import { db } from '#lib/server/db';
import { oauthAccessToken } from '#lib/server/db/schema';
import { error } from '@sveltejs/kit';

export const rotateClientSecret = command(z.string(), async (app) => {
	const event = getRequestEvent();

	const user = event.locals.user;

	if (!user || user.role !== 'admin') {
		return error(401, 'Unauthorized');
	}

	try {
		const result = await auth.api.rotateClientSecret({
			body: {
				client_id: app
			},
			headers: event.request.headers
		});

		return result.client_secret;
	} catch (err) {
		if (err instanceof APIError) {
			return error(500, err.message);
		}
		console.error(err);
		return error(500, 'Unknown error');
	}
});

export const revokeAuthorization = command(z.string(), async (app) => {
	const event = getRequestEvent();
	const user = event.locals.user;

	if (!user || user.role !== 'admin') {
		return error(401, 'Unauthorized');
	}

	const tokens = await db.query.oauthAccessToken.findMany({
		where: {
			clientId: app,
			revoked: {
				isNotNull: true
			}
		}
	});

	if (tokens.length === 0) {
		return false;
	}

	try {
		await db.update(oauthAccessToken).set({
			revoked: new Date(),
			sessionId: null
		});
		return true;
	} catch (err) {
		console.error(err);
		return error(500, 'Unknown error');
	}
});

export const deleteApp = command(z.string(), async (app) => {
	const event = getRequestEvent();

	const user = event.locals.user;

	if (!user || user.role !== 'admin') {
		return error(401, 'Unauthorized');
	}

	try {
		await auth.api.deleteOAuthClient({
			body: {
				client_id: app
			},
			headers: event.request.headers
		});

		return true;
	} catch (err) {
		if (err instanceof APIError) {
			return error(500, err.message);
		}
		console.error(err);
		return error(500, 'Unknown error');
	}
});
