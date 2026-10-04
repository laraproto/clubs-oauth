import { query, getRequestEvent } from '$app/server';
import { error } from '@sveltejs/kit';
import z from 'zod';
import { db } from '#lib/server/db';

export const getApp = query(z.string(), async (id: string) => {
	const event = getRequestEvent();

	const user = event.locals.user;

	if (!user || user.role !== 'admin') {
		return error(401, 'Unauthorized');
	}

	const app = await db.query.oauthClient.findFirst({
		where: {
			clientId: id
		},
		with: {
			user: true
		}
	});

	if (!app) {
		return null;
	}

	return app;
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
		},
		with: {
			user: true
		}
	});

	if (!apps) {
		return null;
	}

	return apps;
});
