import {
	ORIGIN,
	APP_SECRET,
	OAUTH_CLIENT_ID,
	OAUTH_CLIENT_SECRET,
	ADMIN_EMAILS
} from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from '@better-auth/drizzle-adapter/relations-v2';
import { jwt, admin, genericOAuth } from 'better-auth/plugins';
import { oauthProvider } from '@better-auth/oauth-provider';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { db } from '#lib/server/db';
import * as schema from '#lib/server/db/schema';
import { createAuthMiddleware } from 'better-auth/api';

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
			if (!ctx.path.startsWith('/oauth2/callback')) {
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

			ctx.context.internalAdapter.updateUser(ctx.context.newSession.user.id, {
				role: 'admin'
			});
		})
	}
});
