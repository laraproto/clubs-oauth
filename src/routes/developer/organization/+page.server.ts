import type { PageServerLoad, Actions } from './$types';
import { auth } from '#lib/server/auth';
import { APIError } from 'better-auth';
import { addMemberSchema } from './schema';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { redirect, setFlash } from 'sveltekit-flash-message/server';
import { zod4 } from 'sveltekit-superforms/adapters';
import type { Organization } from 'better-auth/plugins/organization';

export const load = (async ({ locals, request, cookies }) => {
	let organization: Organization | null = null;
	let memberData: Awaited<ReturnType<typeof auth.api.listMembers>> | null = null;
	try {
		if (locals.session?.activeOrganizationId) {
			organization = await auth.api.getOrganization({
				query: {
					organizationId: locals.session?.activeOrganizationId
				},
				headers: request.headers
			});
			memberData = await auth.api.listMembers({
				query: {
					organizationId: locals.session?.activeOrganizationId,
					limit: 100
				},
				headers: request.headers
			});
		}
	} catch (err) {
		if (err instanceof APIError) {
			return redirect(
				303,
				'/developer/applications',
				{
					type: 'error',
					message: err.message
				},
				cookies
			);
		}
		console.error(err);
	}
	return {
		organization,
		memberData,
		addMemberForm: await superValidate(
			{
				organizationId: organization!.id
			},
			zod4(addMemberSchema),
			{
				id: 'add-member'
			}
		)
	};
}) satisfies PageServerLoad;

export const actions = {
	addMember: async (event) => {
		const form = await superValidate(event, zod4(addMemberSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const organization = await auth.api.getOrganization({
				query: {
					organizationId: form.data.organizationId
				},
				headers: event.request.headers
			});

			if (!organization) {
				setFlash({ type: 'error', message: 'Organization not found' }, event.cookies);
				return setError(form, 'Organization not found');
			}

			await auth.api.createInvitation({
				body: {
					organizationId: form.data.organizationId,
					email: form.data.email,
					role: form.data.role
				},
				headers: event.request.headers
			});

			setFlash({ type: 'success', message: 'Member added' }, event.cookies);
			return {
				form
			};
		} catch (err) {
			if (err instanceof APIError) {
				setFlash({ type: 'error', message: err.message }, event.cookies);
				return setError(form, err.message);
			}
		}
	}
} satisfies Actions;
