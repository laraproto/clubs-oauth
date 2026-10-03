import {
	ORIGIN,
	APP_SECRET,
	OAUTH_CLIENT_ID,
	OAUTH_CLIENT_SECRET,
	ADMIN_EMAILS,
	SMTP_FROM
} from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { jwt, admin, genericOAuth, emailOTP /*, multiSession*/ } from 'better-auth/plugins';
import { oauthProvider } from '@better-auth/oauth-provider';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '#lib/server/db';
import * as schema from '#lib/server/db/schema';
import { APIError, createAuthMiddleware } from 'better-auth/api';
import clubApi from '#lib/server/clubs';
import transporter from '#lib/server/mail';
import render from '../emails';
import OtpEmail from '#lib/emails/otpEmail.svelte';

export const auth = betterAuth({
	baseURL: {
		allowedHosts: [new URL(ORIGIN ?? 'http://localhost:5173').host]
	},
	secret: APP_SECRET,
	database: drizzleAdapter(db, { provider: 'pg', schema }),
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
				void transporter.sendMail({
					from: SMTP_FROM,
					to: email,
					subject: 'Your OTP Code',
					html: await render(OtpEmail, { props: { code: otp, origin: ORIGIN } })
				});
			}
		}),
		oauthProvider({
			loginPage: '/auth/signin',
			consentPage: '/auth/consent',
			allowPublicClientPrelogin: true
		}),
		/*multiSession({
			maximumSessions: 3
		}),*/
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	],
	advanced: {
		trustedProxyHeaders: true
	},
	user: {
		additionalFields: {
			clubRole: {
				type: ['member', 'leader'],
				required: false,
				input: false
			},
			clubName: {
				type: 'string',
				required: false,
				input: false
			}
		}
	},
	hooks: {
		after: createAuthMiddleware(async (ctx) => {
			switch (true) {
				case ctx.path.startsWith('/callback'): {
					if (!ctx.context.newSession) {
						break;
					}

					if (!ctx.request) {
						break;
					}

					const accounts = await ctx.context.internalAdapter.findAccountByUserId(
						ctx.context.newSession.user.id
					);

					const hca = accounts.find((account) => account.providerId === 'hackclub');

					if (!hca) {
						break;
					}

					const isAdmin = ADMIN_EMAILS?.includes(ctx.context.newSession.user.email);

					if (!isAdmin && ctx.context.newSession.user.role === 'user') {
						break;
					}

					console.log(
						`Granting ${isAdmin ? 'admin' : 'user'} role to ${ctx.context.newSession.user.email}`
					);

					ctx.context.internalAdapter.updateUser(ctx.context.newSession.user.id, {
						role: isAdmin ? 'admin' : 'user'
					});

					break;
				}
				case ctx.path.startsWith('/sign-in/email-otp'): {
					if (!ctx.body.email) {
						break;
					}

					if (!ctx.context.newSession) {
						break;
					}

					const [memberClubOk, memberClubError, memberClub] = await clubApi.get('/member/email', {
						queryParams: {
							email: ctx.body.email
						}
					});

					const [leaderClubOk, leaderClubError, leaderClub] = await clubApi.get('/leader', {
						queryParams: {
							email: ctx.body.email
						}
					});

					if (!memberClubOk || !leaderClubOk) {
						console.error(memberClubError || leaderClubError);
						break;
					}

					// shitty ai code
					const clubName =
						(memberClub.club_name && memberClub.club_name.length > 0
							? memberClub.club_name
							: null) ||
						(typeof leaderClub === 'object' &&
						leaderClub !== null &&
						'club_name' in leaderClub &&
						leaderClub.club_name!.length > 0
							? leaderClub.club_name
							: null);

					const clubRole =
						memberClub && memberClub.club_name && memberClub.club_name.length > 0
							? 'member'
							: 'leader';

					await ctx.context.internalAdapter.updateUser(ctx.context.newSession.user.id, {
						clubName,
						clubRole
					});

					break;
				}
			}
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

			// shitty ai code
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

export type Auth = typeof auth;
