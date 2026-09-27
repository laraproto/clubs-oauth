import type { PageServerLoad, Actions } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { formSchema, otpFormSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import clubApi from '#lib/server/clubs';
import { APIError } from 'better-auth';
import { auth } from '#lib/server/auth';

export const load: PageServerLoad = async () => {
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
				}
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

		if (!memberNameOk) {
			console.error(memberNameError);
			return setError(form, 'otp', 'Error fetching member name.');
		}

		try {
			await auth.api.signInEmailOTP({
				body: {
					email: form.data.email,
					otp: form.data.otp,
					name: memberName?.name
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

		return {
			form
		};
	}
} satisfies Actions;
