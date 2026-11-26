import { z } from 'zod';

export const addMemberSchema = z.object({
	organizationId: z.string(),
	email: z.email(),
	role: z.enum(['member', 'admin']).default('member')
});

export type AddMemberSchema = typeof addMemberSchema;
