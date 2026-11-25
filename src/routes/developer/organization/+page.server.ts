import type { PageServerLoad } from './$types';
import { auth } from '#lib/server/auth';
import { redirect } from 'sveltekit-flash-message/server';
import { APIError } from 'better-auth';
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
	return { organization, memberData };
}) satisfies PageServerLoad;
