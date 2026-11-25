import type { PageServerLoad, Actions } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { emailChangeSchema, emailChangeOtpSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import { APIError } from 'better-auth';
import { auth } from '#lib/server/auth';

export const load = (async () => {
	return {
		emailChangeForm: await superValidate(zod4(emailChangeSchema), {
			id: 'email-change-form'
		}),
		verifyEmailOtpForm: await superValidate(zod4(emailChangeOtpSchema), {
			id: 'verify-email-otp-form'
		})
	};
}) satisfies PageServerLoad;

export const actions = {
	changeEmail: async (event) => {
		const form = await superValidate(event, zod4(emailChangeSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const result = await auth.api.requestEmailChangeEmailOTP({
				body: {
					newEmail: form.data.email
				},
				headers: event.request.headers
			});

			if (!result.success) {
				return setError(form, 'email', 'Unknown error.');
			}
		} catch (err) {
			if (err instanceof APIError) {
				console.error(err);
				return setError(form, 'email', err.message);
			}
			console.error(err);
			return setError(form, 'email', 'Unknown error.');
		}

		return {
			form
		};
	},
	verifyEmailOTP: async (event) => {
		const form = await superValidate(event, zod4(emailChangeOtpSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		try {
			const result = await auth.api.changeEmailEmailOTP({
				body: {
					newEmail: form.data.email,
					otp: form.data.otp
				},
				headers: event.request.headers
			});

			if (!result.success) {
				return setError(form, 'otp', 'Invalid OTP.');
			}
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
