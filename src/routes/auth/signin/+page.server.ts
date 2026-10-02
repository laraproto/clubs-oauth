import type { PageServerLoad, Actions } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { formSchema, otpFormSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import clubApi from '#lib/server/clubs';
import { APIError } from 'better-auth';
import { auth } from '#lib/server/auth';
import type { OAuthClient } from '@better-auth/oauth-provider';

export const load: PageServerLoad = async ({ request, url }) => {
	let oauthClient: OAuthClient | null = null;

	if (url.searchParams.has('client_id')) {
		try {
			oauthClient = await auth.api.getOAuthClientPublic({
				headers: request.headers,
				query: {
					client_id: url.searchParams.get('client_id')!
				}
			});
		} catch (err) {
			if (err instanceof APIError) {
				console.error(err);
			} else if (err instanceof Error) {
				throw err;
			}
		}
	}

	return {
		form: await superValidate(zod4(formSchema)),
		otpForm: await superValidate(zod4(otpFormSchema)),
		oauthClient
	};
};

export const actions = {
	email: async (event) => {
		const form = await superValidate(event, zod4(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const result = await auth.api.sendVerificationOTP({
				body: {
					email: form.data.email,
					type: 'sign-in'
				},
				headers: event.request.headers
			});

			if (!result.success) {
				return setError(form, 'email', 'Unknown error.');
			}
		} catch (err) {
			if (err instanceof APIError) {
				return setError(form, 'email', err.message);
			}
			console.error(err);
			return setError(form, 'email', 'Unknown error.');
		}

		return {
			form
		};
	},
	otp: async (event) => {
		const form = await superValidate(event, zod4(otpFormSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const [memberNameOk, memberNameError, memberName] = await clubApi.get('/member/name', {
			queryParams: {
				email: form.data.email
			}
		});

		const [leaderNameOk, leaderNameError, leaderName] = await clubApi.get('/leader/name', {
			queryParams: {
				email: form.data.email
			}
		});

		if (!memberNameOk || !leaderNameOk) {
			console.error(memberNameError || leaderNameError);
			return setError(form, 'otp', 'Error fetching member/leader name.');
		}

		try {
			await auth.api.signInEmailOTP({
				body: {
					email: form.data.email,
					otp: form.data.otp,
					name: memberName?.name || leaderName?.name
				},
				headers: event.request.headers
			});
		} catch (err) {
			if (err instanceof APIError) {
				return setError(form, 'otp', err.message);
			}
			console.error(err);
			return setError(form, 'otp', 'Unknown error.');
		}
	}
} satisfies Actions;
