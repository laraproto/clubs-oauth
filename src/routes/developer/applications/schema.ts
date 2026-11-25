import { z } from 'zod';

export const createRequestSchema = z
	.object({
		name: z.string().min(1, 'Name is required'),
		uri: z.url('URI must be a valid URL').optional(),
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
		organizationName: z.string().optional(),
		organizationId: z.string().default('create')
	})
	.refine(
		(data) =>
			data.organizationId !== 'create' ||
			(data.organizationId === 'create' && data.organizationName),
		{
			message: 'Organization name is required when creating an organization',
			path: ['organizationName']
		}
	);

export type CreateRequestSchema = typeof createRequestSchema;
