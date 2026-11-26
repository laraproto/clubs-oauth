import { form, getRequestEvent } from '$app/server';
import { auth } from '#lib/server/auth';
import { setFlash } from 'sveltekit-flash-message/server';
import { z } from 'zod';
import { APIError } from 'better-auth';

export const removeMember = form(
	z.object({
		organizationId: z.string(),
		memberId: z.string()
	}),
	async (data) => {
		const event = getRequestEvent();

		try {
			const organization = await auth.api.getOrganization({
				query: {
					organizationId: data.organizationId
				},
				headers: event.request.headers
			});

			if (!organization) {
				setFlash({ type: 'error', message: 'Organization not found' }, event.cookies);
				return false;
			}

			await auth.api.removeMember({
				body: {
					memberIdOrEmail: data.memberId,
					organizationId: data.organizationId
				},
				headers: event.request.headers
			});

			setFlash({ type: 'success', message: 'Member removed' }, event.cookies);
			return true;
		} catch (err) {
			if (err instanceof APIError) {
				setFlash({ type: 'error', message: err.message }, event.cookies);
				return false;
			}
			console.error(err);
			setFlash(
				{ type: 'error', message: 'Unknown error, go poke somebody on Slack about it' },
				event.cookies
			);
			return false;
		}
	}
);
