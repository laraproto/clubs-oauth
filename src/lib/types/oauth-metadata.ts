import { z } from 'zod';

export const OAuthMetadataSchema = z
	.object({
		collaborators: z.array(z.string()).optional()
	})
	.nullable();

export const collaboratorDisallowedActions: string[] = [
	'delete',
	'rotate',
	'configure-client-credentials-scopes'
];

export type OAuthMetadata = z.infer<typeof OAuthMetadataSchema>;
