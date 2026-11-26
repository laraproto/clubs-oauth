import type { RequestHandler } from './$types';
import { redirect } from 'sveltekit-flash-message/server';
import { auth } from '#lib/server/auth';
import { APIError } from 'better-auth';
import { resolve } from '$app/paths';

export const GET: RequestHandler = async ({ request, params, cookies }) => {
	try {
		const result = await auth.api.acceptInvitation({
			body: {
				invitationId: params.id
			},
			headers: request.headers
		});

		await auth.api.setActiveOrganization({
			body: {
				organizationId: result.invitation.organizationId
			},
			headers: request.headers
		});
	} catch (err) {
		if (err instanceof APIError) {
			return redirect(
				303,
				resolve('/developer/dashboard'),
				{
					type: 'error',
					message: err.message
				},
				cookies
			);
		}
		console.error(err);
		return redirect(
			303,
			resolve('/developer/dashboard'),
			{
				type: 'error',
				message: 'An unexpected error occurred, go poke somebody on Slack about it.'
			},
			cookies
		);
	}

	return redirect(
		303,
		resolve('/developer/organization'),
		{
			type: 'success',
			message: 'Organization invite accepted'
		},
		cookies
	);
};
