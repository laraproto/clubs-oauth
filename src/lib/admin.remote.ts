import { command, getRequestEvent } from '$app/server';
import { z } from 'zod';
import { db } from '#lib/server/db';
import * as schema from '#lib/server/db/schema';
import { auth } from '#lib/server/auth';
import { eq } from 'drizzle-orm';
import { setFlash } from 'sveltekit-flash-message/server';

export const processRequest = command(
	z.object({
		accept: z.boolean(),
		reason: z.string().nullable(),
		id: z.string()
	}),
	async (app) => {
		const event = getRequestEvent();

		try {
			const request = await db.query.applicationRequests.findFirst({
				where: {
					id: app.id
				}
			});

			if (!request) {
				setFlash({ type: 'error', message: 'Application request not found' }, event.cookies);
				return false;
			}

			if (!app.accept) {
				await db
					.update(schema.applicationRequests)
					.set({
						status: 'rejected',
						reviewerId: event.locals.user?.id ?? null,
						process_reason: app.reason ?? null
					})
					.where(eq(schema.applicationRequests.id, app.id));
				setFlash(
					{
						type: 'success',
						message: `Application request ${request.name} rejected`
					},
					event.cookies
				);
				return true;
			}

			let organizationId = request.organizationId;
			if (request.createOrg && request.organizationName) {
				console.log('Creating organization for request', request.id);
				const newOrg = await auth.api.createOrganization({
					body: {
						name: request.organizationName,
						userId: request.userId,
						slug: crypto.randomUUID()
					}
				});
				organizationId = newOrg.id;
			}

			const originalOrganizationId =
				(event.locals.session?.activeOrganizationId as string | undefined) ?? undefined;

			console.log('Setting active organization to', organizationId);
			await auth.api.setActiveOrganization({
				body: {
					organizationId
				},
				headers: event.request.headers
			});

			console.log('Creating OAuth client for request', request.id);
			await auth.api.adminCreateOAuthClient({
				body: {
					client_name: request.name,
					client_uri: request.uri ?? undefined,
					logo_uri: request.logo ?? undefined,
					scope: request.scopes,
					redirect_uris: request.redirectUris
				},
				headers: event.request.headers
			});

			console.log('Restoring original active organization to', originalOrganizationId);
			await auth.api.setActiveOrganization({
				body: {
					organizationId: originalOrganizationId ?? null
				},
				headers: event.request.headers
			});

			await db
				.update(schema.applicationRequests)
				.set({
					status: 'accepted',
					reviewerId: event.locals.user?.id ?? null,
					process_reason: app.reason ?? null
				})
				.where(eq(schema.applicationRequests.id, app.id));

			setFlash(
				{
					type: 'success',
					message: `Application request ${request.name} accepted`
				},
				event.cookies
			);
			return true;
		} catch (err) {
			console.error(err);
			setFlash({ type: 'error', message: 'Unknown error' }, event.cookies);
			return false;
		}
	}
);
