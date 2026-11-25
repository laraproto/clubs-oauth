import { db } from '#lib/server/db';
import type { OAuthMetadata } from '#lib/types/oauth-metadata';
import { getApp } from '../../data.remote';
import type { PageServerLoad } from './$types';

export const load = (async ({ params }) => {
	const app = await getApp(params.app);

	let collaborators: {
		id: string;
		email: string;
		name: string;
		image: string | null;
	}[] = [];

	if ((app?.metadata as OAuthMetadata)?.collaborators) {
		const collaboratorsIds = (app?.metadata as OAuthMetadata)?.collaborators;

		collaborators = (await Promise.all(
			collaboratorsIds!.map(async (collaboratorId) => {
				const user = await db.query.user.findFirst({
					where: {
						id: collaboratorId
					}
				});

				if (user) {
					return {
						id: user.id,
						email: user.email,
						name: user.name,
						image: user.image
					};
				}
			})
		)) as {
			id: string;
			email: string;
			name: string;
			image: string | null;
		}[];
	}

	return {
		app: await getApp(params.app),
		collaborators
	};
}) satisfies PageServerLoad;
