import type { Actions, PageServerLoad } from './$types';
import { createRequestSchema } from './schema';
import { auth } from '#lib/server/auth';
import { fail, message, setError, superValidate } from 'sveltekit-superforms';
import { setFlash } from 'sveltekit-flash-message/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db, schema } from '#lib/server/db';

export const load = (async ({ request }) => {
	return {
		applications: await auth.api.getOAuthClients({
			headers: request.headers
		}),
		requestForm: await superValidate(zod4(createRequestSchema), {
			id: 'create-request'
		})
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(createRequestSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const createOrg = form.data.organizationId === 'create';

			await db.insert(schema.applicationRequests).values({
				name: form.data.name,
				uri: form.data.uri,
				logo: form.data.logo,
				scopes: form.data.scopes,
				redirectUris: form.data.redirectUris,
				createOrg: createOrg,
				organizationId: createOrg ? null : form.data.organizationId,
				organizationName: createOrg ? form.data.organizationName : null,
				userId: event.locals.user!.id
			});
		} catch (error) {
			console.error(error);
			return setError(form, 'An unexpected error occurred, go poke somebody on Slack about it');
		}

		setFlash(
			{
				type: 'success',
				message: 'Application request submitted'
			},
			event
		);
		return message(form, 'Application request submitted');
	}
} satisfies Actions;
