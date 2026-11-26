import type { PageServerLoad, Actions } from './$types';
import { auth } from '#lib/server/auth';
import { APIError } from 'better-auth';
import { editApplicationSchema } from './schema';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import { resolve } from '$app/paths';
import { getApp } from '../../../data.remote';

export const load = (async ({ params, cookies }) => {
	const app = await getApp(params.app);

	if (!app) {
		return redirect(
			303,
			'/developer/applications',
			{
				type: 'error',
				message: 'Application not found'
			},
			cookies
		);
	}

	return {
		app,
		editApplicationForm: await superValidate(
			{
				name: app.name ?? undefined,
				uri: app.uri ?? undefined,
				logo: app.icon ?? undefined,
				scopes: app.scopes?.join(' '),
				redirectUris: app.redirectUris,
				skipConsent: app.skipConsent ?? false
			},
			zod4(editApplicationSchema),
			{
				id: 'edit-application'
			}
		)
	};
}) satisfies PageServerLoad;

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(editApplicationSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			await auth.api.adminUpdateOAuthClient({
				body: {
					client_id: event.params.app,
					update: {
						client_name: form.data.name,
						client_uri: form.data.uri ?? undefined,
						logo_uri: form.data.logo ?? undefined,
						scope: form.data.scopes,
						redirect_uris: form.data.redirectUris,
						skip_consent: form.data.skipConsent
					}
				},
				headers: event.request.headers
			});
		} catch (error) {
			if (error instanceof APIError) {
				setFlash(
					{
						type: 'error',
						message:
							error.message.length > 0 ? error.message : 'Client not found or authorization missing'
					},
					event.cookies
				);
				return setError(form, error.message.length > 0 ? error.message : 'Unknown error');
			}
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
			resolve(`/developer/admin/applications/[app]`, { app: event.params.app }),
			{
				type: 'success',
				message: 'Application updated'
			},
			event
		);
	}
} satisfies Actions;
