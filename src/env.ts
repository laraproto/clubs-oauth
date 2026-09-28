import { building } from '$app/env';
import { z } from 'zod';
import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DATABASE_URL: { description: 'The database connection string.' },
	ORIGIN: {
		description: 'The app origin (base URL), e.g. `http://localhost:5173`.'
	},
	APP_SECRET: {
		description:
			'Secret used to sign tokens. For production use 32 characters generated with high entropy. See [Better Auth installation](https://www.better-auth.com/docs/installation).'
	},
	CLUBS_API_KEY: {
		description: 'The API key for the Hack Club Clubs API.'
	},
	OAUTH_CLIENT_ID: {
		description: 'The client ID for the OAuth provider.'
	},
	OAUTH_CLIENT_SECRET: {
		description: 'The client secret for the OAuth provider.'
	},
	ADMIN_EMAILS: {
		description:
			'Comma-separated list of email addresses that should be considered admins. These users will be able to access the admin dashboard.',
		schema: building
			? z.optional(z.string().transform((value) => value.split(',').map((email) => email.trim())))
			: z.string().transform((value) => value.split(',').map((email) => email.trim()))
	},
	SMTP_HOST: {
		description: 'The SMTP host for sending emails.'
	},
	SMTP_PORT: {
		description: 'The SMTP port for sending emails.',
		schema: z.string().transform((value) => parseInt(value, 10))
	},
	SMTP_FROM: {
		description: 'The SMTP from address for sending emails.',
		schema: z.string()
	},
	SMTP_USER: {
		description: 'The SMTP username for sending emails.',
		schema: z.optional(z.string())
	},
	SMTP_PASS: {
		description: 'The SMTP password for sending emails.',
		schema: z.optional(z.string())
	}
});
