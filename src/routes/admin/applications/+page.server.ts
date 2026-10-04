import type { PageServerLoad, Actions } from './$types';
import { createApplicationSchema } from './schema';
import { superValidate, setError, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { auth } from '#lib/server/auth';
import { APIError } from 'better-auth/api';
import { getApps } from '../data.remote';

export const load = (async () => {
	return {
		applicationForm: await superValidate(zod4(createApplicationSchema), {
			id: 'create-application'
		}),
		applications: await getApps()
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(createApplicationSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const result = await auth.api.adminCreateOAuthClient({
				headers: event.request.headers,
				body: {
					client_name: form.data.name,
					client_uri: form.data.uri,
					logo_uri: form.data.logo,
					scope: form.data.scopes,
					redirect_uris: form.data.redirectUris,
					skip_consent: form.data.skipConsent
				}
			});
			console.log(result);
		} catch (err) {
			if (err instanceof APIError) {
				return setError(form, 'name', err.message);
			}
			console.error(err);
			return fail(500, { form });
		}

		return {
			form
		};
	}
} satisfies Actions;
