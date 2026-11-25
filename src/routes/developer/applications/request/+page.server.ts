import type { PageServerLoad, Actions } from './$types';
import { createRequestSchema } from './schema';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import { db, schema } from '#lib/server/db';
import { resolve } from '$app/paths';

export const load = (async () => {
	return {
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
				reason: form.data.reason,
				organizationId: createOrg ? null : form.data.organizationId,
				organizationName: createOrg ? form.data.organizationName : null,
				userId: event.locals.user!.id
			});
		} catch (error) {
			console.error(error);
			setFlash(
				{
					type: 'error',
					message: 'An unexpected error occurred, go poke somebody on Slack about it'
				},
				event.cookies
			);
			return setError(form, 'An unexpected error occurred, go poke somebody on Slack about it');
		}

		return redirect(
			303,
			resolve('/developer/applications'),
			{
				type: 'success',
				message: 'Application request submitted'
			},
			event
		);
	}
} satisfies Actions;
