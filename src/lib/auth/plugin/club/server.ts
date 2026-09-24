import { createAuthClient } from 'better-auth/client';
import type { BetterAuthPlugin } from 'better-auth';

export const clubAuthPlugin = () =>
	({
		id: 'clubAuthPlugin'
	}) satisfies BetterAuthPlugin;
