import type { PageServerLoad, Actions } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { formSchema, otpFormSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import clubApi from '#lib/server/clubs';
import { APIError } from 'better-auth';
import { auth } from '#lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, locals }) => {
	if (locals.user || locals.session) {
		return redirect(302, decodeURIComponent(url.searchParams.get('return_to') || '/'));
	}

	return {
		form: await superValidate(zod4(formSchema)),
		otpForm: await superValidate(zod4(otpFormSchema))
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

		const params = event.url.searchParams;
		params.delete('/otp');

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

			if (params.has('redirect_uri')) {
				return redirect(303, `/auth/consent?${params.toString()}`);
			} else {
				return redirect(303, decodeURIComponent(params.get('return_to') || '/user'));
			}
		} catch (err) {
			if (err instanceof APIError) {
				return setError(form, 'otp', err.message);
			}
			console.error(err);
			return setError(form, 'otp', 'Unknown error.');
		}
	},
	hca: async (event) => {
		const params = event.url.searchParams;
		params.delete('/hca');

		const result = await auth.api.signInSocial({
			body: {
				provider: 'hackclub',
				callbackURL: params.has('redirect_uri')
					? `/auth/consent?${params.toString()}`
					: decodeURIComponent(params.get('return_to') || '/user')
			},
			headers: event.request.headers
		});
		if (result.url) {
			return redirect(303, result.url, { external: true });
		} else {
			return redirect(303, '/');
		}
	}
} satisfies Actions;
