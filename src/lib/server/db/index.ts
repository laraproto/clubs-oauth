import { drizzle } from 'drizzle-orm/bun-sql';
import { relations } from './relations';
import { authRelations } from './auth.schema';
import { DATABASE_URL } from '$app/env/private';

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const db = drizzle(DATABASE_URL, {
	relations: { ...relations, ...authRelations }
});
