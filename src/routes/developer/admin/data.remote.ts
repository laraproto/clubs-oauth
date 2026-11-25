import { query, getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import z from 'zod';
import { db, schema } from '#lib/server/db';
import { count, or, inArray, ilike, eq } from 'drizzle-orm';

export const getApp = query(z.string(), async (id: string) => {
	const event = getRequestEvent();

	const user = event.locals.user;

	if (!user || user.role !== 'admin') {
		return error(401, 'Unauthorized');
	}

	const app = await db.query.oauthClient.findFirst({
		where: {
			clientId: id
		}
	});

	if (!app) {
		return null;
	}

	const appComplete = {
		...app,
		organization: await db.query.organization.findFirst({
			where: {
				id: app.referenceId!
			}
		})
	};

	return appComplete;
});

export const getApps = query(async () => {
	const event = getRequestEvent();

	const user = event.locals.user;

	if (!user || user.role !== 'admin') {
		return error(401, 'Unauthorized');
	}

	const apps = await db.query.oauthClient.findMany({
		orderBy: {
			name: 'asc'
		}
	});

	if (!apps) {
		return null;
	}

	const appsWithOrgs = await Promise.all(
		apps.map(async (app) => {
			const organization = await db.query.organization.findFirst({
				where: {
					id: app.referenceId!
				}
			});
			return {
				...app,
				organization
			};
		})
	);

	return appsWithOrgs;
});

export const getAppRequests = query(
	z.object({
		query: z.string().optional(),
		page: z.number().min(1).optional().default(1),
		limit: z.number().optional().default(10)
	}),
	async (input) => {
		const event = getRequestEvent();

		const user = event.locals.user;

		if (!user || user.role !== 'admin') {
			return error(401, 'Unauthorized');
		}

		const queryLike = `%${input.query || ''}%`;

		const rowQuery = await db
			.select({ value: count() })
			.from(schema.applicationRequests)
			.where(
				or(
					ilike(schema.applicationRequests.reason, queryLike),
					inArray(
						schema.applicationRequests.userId,
						db
							.select({ id: schema.user.id })
							.from(schema.user)
							.where(ilike(schema.user.email, queryLike))
					)
				)
			);

		let totalApplicationRequests = 0;

		if (rowQuery[0]) {
			totalApplicationRequests = Number(rowQuery[0].value);
		}

		const pageCount = Math.max(1, Math.ceil(totalApplicationRequests / input.limit));

		if (input.page > pageCount) {
			input.page = pageCount;
		}

		const applicationRequests = await db.query.applicationRequests.findMany({
			limit: input.limit,
			offset: (input.page - 1) * input.limit,
			where: {
				OR: [
					{
						reason: { ilike: queryLike }
					},
					{
						user: {
							id: {
								ilike: queryLike
							}
						}
					}
				]
			},
			orderBy: {
				created_at: 'desc'
			},
			with: {
				user: true,
				organization: true,
				reviewer: true
			}
		});

		const pendingApplicationRequests = await db.query.applicationRequests.findMany({
			where: {
				status: 'pending'
			},
			orderBy: {
				created_at: 'asc'
			},
			with: {
				user: true,
				organization: true,
				reviewer: true
			}
		});

		return {
			all: applicationRequests,
			pending: pendingApplicationRequests,
			pageCount,
			count: totalApplicationRequests
		};
	}
);
