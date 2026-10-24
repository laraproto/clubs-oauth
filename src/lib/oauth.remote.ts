import { command, getRequestEvent } from '$app/server';
import { z } from 'zod';
import { APIError } from 'better-auth/api';
import { auth } from '#lib/server/auth';
import { db } from '#lib/server/db';
import * as schema from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { setFlash } from 'sveltekit-flash-message/server';
import type { OAuthMetadata } from './types/oauth-metadata';

export const rotateClientSecret = command(z.string(), async (app) => {
	const event = getRequestEvent();

	const oauthClient = await db.query.oauthClient.findFirst({
		where: {
			clientId: app
		}
	});

	if (!oauthClient) {
		setFlash({ type: 'error', message: 'Unknown error' }, event.cookies);
		return false;
	}

	try {
		const result = await auth.api.rotateClientSecret({
			body: {
				client_id: app
			},
			headers: event.request.headers
		});

		setFlash({ type: 'success', message: 'Client secret rotated successfully' }, event.cookies);
		return result.client_secret;
	} catch (err) {
		console.log(err);
		if (err instanceof APIError) {
			setFlash(
				{
					type: 'error',
					message:
						err.message.length > 0 ? err.message : 'Client not found or authorization missing'
				},
				event.cookies
			);
			return false;
		}
		console.error(err);
		setFlash({ type: 'error', message: 'Unknown error' }, event.cookies);
		return false;
	}
});

export const revokeAuthorization = command(z.string(), async (app) => {
	const event = getRequestEvent();
	const oauthClient = await db.query.oauthClient.findFirst({
		where: {
			clientId: app
		}
	});

	if (!oauthClient) {
		setFlash(
			{
				type: 'error',
				message: 'Client not found or authorization missing'
			},
			event.cookies
		);
		return false;
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
		let revokedCount = 0;
		for (const token of tokens) {
			await db
				.update(schema.oauthAccessToken)
				.set({
					revoked: new Date(),
					sessionId: null
				})
				.where(eq(schema.oauthAccessToken.id, token.id));
		}
		revokedCount = tokens.length;
		setFlash({ type: 'info', message: `Revoked ${revokedCount} access tokens` }, event.cookies);
		return revokedCount;
	} catch (err) {
		console.error(err);
		setFlash({ type: 'error', message: 'Unknown error' }, event.cookies);
		return false;
	}
});

export const deleteApp = command(z.string(), async (app) => {
	const event = getRequestEvent();

	const oauthClient = await db.query.oauthClient.findFirst({
		where: {
			clientId: app
		}
	});

	if (!oauthClient) {
		setFlash(
			{ type: 'error', message: 'Client not found or authorization missing' },
			event.cookies
		);
		return false;
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
			setFlash(
				{
					type: 'error',
					message:
						err.message.length > 0 ? err.message : 'Client not found or authorization missing'
				},
				event.cookies
			);
			return false;
		}
		console.error(err);
		setFlash({ type: 'error', message: 'Unknown error' }, event.cookies);
		return false;
	}
});

export const transferOwnership = command(
	z.object({ app: z.string(), newOwnerEmail: z.email() }),
	async ({ app, newOwnerEmail }) => {
		const event = getRequestEvent();

		const user = event.locals.user;

		if (!user || user.role !== 'admin') {
			setFlash({ type: 'error', message: 'Unauthorized' }, event.cookies);
			return false;
		}

		const newUser = await db.query.user.findFirst({
			where: {
				email: newOwnerEmail
			}
		});

		if (!newUser) {
			setFlash({ type: 'error', message: 'User not found' }, event.cookies);
			return false;
		}

		const provider = await db.query.account.findFirst({
			where: {
				userId: newUser.id,
				providerId: 'hackclub'
			}
		});

		if (!provider) {
			setFlash({ type: 'error', message: 'User is not logged in through HCA' }, event.cookies);
			return false;
		}

		try {
			await db
				.update(schema.oauthClient)
				.set({
					userId: newUser.id
				})
				.where(eq(schema.oauthClient.clientId, app));

			setFlash({ type: 'success', message: 'Ownership transferred successfully' }, event.cookies);
			return true;
		} catch (err) {
			console.error(err);
			setFlash({ type: 'error', message: 'Unknown error' }, event.cookies);
			return false;
		}
	}
);

export const addCollaborator = command(
	z.object({ app: z.string(), collaboratorEmail: z.email() }),
	async ({ app, collaboratorEmail }) => {
		const event = getRequestEvent();

		const user = event.locals.user;

		const oauthClient = await db.query.oauthClient.findFirst({
			where: {
				clientId: app
			}
		});

		if (!oauthClient) {
			setFlash(
				{ type: 'error', message: 'Client not found or authorization missing' },
				event.cookies
			);
			return false;
		}

		if (!user || (user.role !== 'admin' && user.id !== oauthClient.userId)) {
			setFlash(
				{ type: 'error', message: 'Client not found or authorization missing' },
				event.cookies
			);
			return false;
		}

		const newUser = await db.query.user.findFirst({
			where: {
				email: collaboratorEmail
			}
		});

		if (!newUser) {
			setFlash({ type: 'error', message: 'User not found' }, event.cookies);
			return false;
		}

		const provider = await db.query.account.findFirst({
			where: {
				userId: newUser.id,
				providerId: 'hackclub'
			}
		});

		if (!provider) {
			setFlash({ type: 'error', message: 'User is not logged in through HCA' }, event.cookies);
			return false;
		}

		try {
			const metadata: OAuthMetadata = oauthClient.metadata || { collaborators: [] };
			if (!metadata.collaborators?.includes(newUser.id)) {
				metadata.collaborators?.push(newUser.id);
			}

			await db
				.update(schema.oauthClient)
				.set({ metadata })
				.where(eq(schema.oauthClient.clientId, app));

			setFlash({ type: 'success', message: 'Collaborator added successfully' }, event.cookies);
			return true;
		} catch (err) {
			console.error(err);
			setFlash({ type: 'error', message: 'Unknown error' }, event.cookies);
			return false;
		}
	}
);

export const removeCollaborator = command(
	z.object({ app: z.string(), collaboratorId: z.string() }),
	async ({ app, collaboratorId }) => {
		const event = getRequestEvent();

		const user = event.locals.user;

		const oauthClient = await db.query.oauthClient.findFirst({
			where: {
				clientId: app
			}
		});

		if (!oauthClient) {
			setFlash(
				{ type: 'error', message: 'Client not found or authorization missing' },
				event.cookies
			);
			return false;
		}

		if (!user || (user.role !== 'admin' && user.id !== oauthClient.userId)) {
			setFlash(
				{ type: 'error', message: 'Client not found or authorization missing' },
				event.cookies
			);
			return false;
		}

		try {
			const metadata: OAuthMetadata = oauthClient.metadata || { collaborators: [] };
			if (metadata.collaborators?.includes(collaboratorId)) {
				metadata.collaborators = metadata.collaborators.filter((id) => id !== collaboratorId);
			}

			await db
				.update(schema.oauthClient)
				.set({ metadata })
				.where(eq(schema.oauthClient.clientId, app));

			setFlash({ type: 'success', message: 'Collaborator removed successfully' }, event.cookies);
			return true;
		} catch (err) {
			console.error(err);
			setFlash({ type: 'error', message: 'Unknown error' }, event.cookies);
			return false;
		}
	}
);
