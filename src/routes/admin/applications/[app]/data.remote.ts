import { command, getRequestEvent } from '$app/server';
import { z } from 'zod';
import { APIError } from 'better-auth/api';
import { auth } from '#lib/server/auth';
import { db } from '#lib/server/db';
import { oauthAccessToken, oauthClient } from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';

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
		for (const token of tokens) {
			await db
				.update(oauthAccessToken)
				.set({
					revoked: new Date(),
					sessionId: null
				})
				.where(eq(oauthAccessToken.id, token.id));
		}
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

export const transferOwnership = command(
	z.object({ app: z.string(), newOwnerEmail: z.email() }),
	async ({ app, newOwnerEmail }) => {
		const event = getRequestEvent();

		const user = event.locals.user;

		if (!user || user.role !== 'admin') {
			return error(401, 'Unauthorized');
		}

		const newUser = await db.query.user.findFirst({
			where: {
				email: newOwnerEmail
			}
		});

		if (!newUser) {
			setFlash({ type: 'error', message: 'User not found' }, event.cookies);
			return error(400, 'User not found');
		}

		const provider = await db.query.account.findFirst({
			where: {
				userId: newUser.id,
				providerId: 'hackclub'
			}
		});

		if (!provider) {
			setFlash({ type: 'error', message: 'User is not logged in through HCA' }, event.cookies);
			return error(400, 'User is not logged in through HCA');
		}

		try {
			await db
				.update(oauthClient)
				.set({
					userId: newUser.id
				})
				.where(eq(oauthClient.clientId, app));

			setFlash({ type: 'success', message: 'Ownership transferred successfully' }, event.cookies);
			return true;
		} catch (err) {
			console.error(err);
			return error(500, 'Unknown error');
		}
	}
);
