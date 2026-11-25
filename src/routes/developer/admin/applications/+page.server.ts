import type { PageServerLoad, Actions } from './$types';
import { createApplicationSchema } from './schema';
import { superValidate, fail } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { auth } from '#lib/server/auth';
import { getApps } from '../data.remote';
import type { OAuthMetadata } from '#lib/types/oauth-metadata';
import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

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

        const metadata: OAuthMetadata = {
            collaborators: []
        };
            const result = await auth.api.adminCreateOAuthClient({
                headers: event.request.headers,
                body: {
                    client_name: form.data.name,
                    client_uri: form.data.uri,
                    logo_uri: form.data.logo,
                    scope: form.data.scopes,
                    redirect_uris: form.data.redirectUris,
                    skip_consent: form.data.skipConsent,
                    metadata
                }
            });

            redirect(
                303,
                resolve('/developer/applications/[app]', {
                    app: result.client_id
                })
            );
            

        return {
            form
        };
    }
} satisfies Actions;
