import { command, getRequestEvent } from '$app/server';
import { z } from 'zod';
import { APIError } from 'better-auth/api';
import { auth, clientPrivileges } from '#lib/server/auth';
import { db } from '#lib/server/db';
import * as schema from '#lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { setFlash } from 'sveltekit-flash-message/server';

export const rotateClientSecret = command(z.string(), async (app) => {
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
		let originalOrgId: string | undefined = undefined;
		let partOfOrg = false;
		let memberId: string | undefined = undefined;
		if (event.locals.user?.role === 'admin') {
			originalOrgId = event.locals.session?.activeOrganizationId ?? undefined;
			try {
				const result = await auth.api.addMember({
					body: {
						userId: event.locals.user?.id ?? '',
						organizationId: oauthClient.referenceId!,
						role: 'admin'
					}
				});
				memberId = result.id;
			} catch (err) {
				if (err instanceof APIError) {
					if (err.body?.code === 'USER_IS_ALREADY_A_MEMBER_OF_THIS_ORGANIZATION') {
						partOfOrg = true;
					}
				}
				// Ignore
			}
			await auth.api.setActiveOrganization({
				body: {
					organizationId: oauthClient.referenceId
				},
				headers: event.request.headers
			});
		}

		const result = await auth.api.rotateClientSecret({
			body: {
				client_id: app
			},
			headers: event.request.headers
		});

		if (event.locals.user?.role === 'admin') {
			await auth.api.setActiveOrganization({
				body: {
					organizationId: originalOrgId
				},
				headers: event.request.headers
			});
			if (!partOfOrg && memberId) {
				try {
					await auth.api.removeMember({
						body: {
							memberIdOrEmail: memberId,
							organizationId: oauthClient.referenceId!
						},
						headers: event.request.headers
					});
				} catch (err) {
					console.error(err);
					//Ignore
				}
			}
		}

		setFlash({ type: 'success', message: 'Client secret rotated' }, event.cookies);
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

	if (
		clientPrivileges &&
		!(await clientPrivileges({
			action: 'rotate',
			headers: event.request.headers,
			session: event.locals.session,
			user: event.locals.user,
			clientId: app
		}))
	) {
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
		setFlash({ type: 'info', message: 'No access tokens to revoke' }, event.cookies);
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
