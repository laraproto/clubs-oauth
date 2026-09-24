import type { PageServerLoad, Actions } from './$types';
import { fail, setError, superValidate } from 'sveltekit-superforms';
import { formSchema } from './schema';
import { zod4 } from 'sveltekit-superforms/adapters';
import clubApi from '#lib/server/clubs';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(zod4(formSchema))
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, zod4(formSchema));
		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const isMember = await clubApi.GET('/member/email', {
			params: {
				query: {
					email: form.data.email
				}
			}
		});

		const isLeader = await clubApi.GET('/leader', {
			params: {
				query: {
					email: form.data.email
				}
			}
		});

		const inAClub = (isMember.data && isMember.data.length > 0) || !!isLeader.data;

		if (!inAClub) {
			return setError(form, 'email', 'No club membership found for this email.');
		}

		return {
			form
		};
	}
} satisfies Actions;
