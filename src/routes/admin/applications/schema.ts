import { z } from 'zod';

export const createApplicationSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	logo: z.httpUrl('Logo must be a valid URL').optional(),
	scopes: z.string().default('openid profile email'),
	redirectUris: z
		.array(z.httpUrl())
		.nonempty('At least one redirect URI is required')
		.refine(
			(uris) => uris.every((uri) => uri.startsWith('https://') || uri.startsWith('http://')),
			{
				message:
					'One or more redirect URIs are invalid. They must start with "https://" or "http://".'
			}
		),
	skipConsent: z.boolean().default(false)
});

export type CreateApplicationSchema = typeof createApplicationSchema;
