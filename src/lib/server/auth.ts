import {
	ORIGIN,
	APP_SECRET,
	OAUTH_CLIENT_ID,
	OAUTH_CLIENT_SECRET,
	ADMIN_EMAILS
} from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { jwt, admin, genericOAuth, emailOTP } from 'better-auth/plugins';
import { oauthProvider } from '@better-auth/oauth-provider';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '#lib/server/db';
import * as schema from '#lib/server/db/schema';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import clubApi from '#lib/server/clubs';

export const auth = betterAuth({
	baseURL: ORIGIN,
	secret: APP_SECRET,
	database: drizzleAdapter(db, { provider: 'pg', schema }),
	emailAndPassword: { enabled: true },
	plugins: [
		genericOAuth({
			config: [
				{
					providerId: 'hackclub',
					clientId: OAUTH_CLIENT_ID,
					clientSecret: OAUTH_CLIENT_SECRET,
					discoveryUrl: 'https://auth.hackclub.com/.well-known/openid-configuration',
					scopes: ['openid', 'profile', 'email', 'slack_id'],
					overrideUserInfo: true
				}
			]
		}),
		admin(),
		jwt(),
		emailOTP({
			overrideDefaultEmailVerification: false,
			sendVerificationOTP: async ({ email, otp, type }) => {
				if (type !== 'sign-in') {
					return;
				}
				console.log(`Sending OTP ${otp} to ${email}`);
			}
		}),
		oauthProvider({
			loginPage: '/auth/signin',
			consentPage: '/auth/consent'
		}),
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	],
	user: {
		additionalFields: {
			clubRole: {
				type: ['member', 'leader'],
				required: false,
				input: false
			}
		}
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			if (!ctx.path.startsWith('/callback')) {
				return;
			}

			if (!ctx.context.newSession) {
				return;
			}

			if (!ctx.request) {
				return;
			}

			const accounts = await ctx.context.internalAdapter.findAccountByUserId(
				ctx.context.newSession.user.id
			);

			const hca = accounts.find((account) => account.providerId === 'hackclub');

			if (!hca) {
				return;
			}

			if (!ADMIN_EMAILS?.includes(ctx.context.newSession.user.email)) {
				return;
			}

			console.log(`Granting admin role to ${ctx.context.newSession.user.email}`);

			ctx.context.internalAdapter.updateUser(ctx.context.newSession.user.id, {
				role: 'admin'
			});
		}),
		before: createAuthMiddleware(async (ctx) => {
			if (!ctx.path.startsWith('/email-otp')) {
				return;
			}

			if (!ctx.body.email) {
				throw new APIError('BAD_REQUEST', { message: 'Email is required.' });
			}

			const [isMemberOk, isMemberError, isMember] = await clubApi.get('/member/email', {
				queryParams: {
					email: ctx.body.email
				},
				parseAs: 'text'
			});

			const [isLeaderOk, isLeaderError, isLeader] = await clubApi.get('/leader', {
				queryParams: {
					email: ctx.body.email
				}
			});

			if (!isMemberOk || !isLeaderOk) {
				console.error(isMemberError || isLeaderError);
				throw new APIError('BAD_REQUEST', {
					message: 'Error checking club membership.',
					cause: isMemberError || isLeaderError
				});
			}

			const inAClub =
				(isMember && isMember.length > 0) ||
				(typeof isLeader === 'object' &&
					isLeader !== null &&
					'club_name' in isLeader &&
					isLeader.club_name!.length > 0);

			if (!inAClub) {
				throw new APIError('BAD_REQUEST', { message: 'No club membership found for this email.' });
			}
		})
	}
});
