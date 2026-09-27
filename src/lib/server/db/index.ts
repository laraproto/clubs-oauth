import { drizzle } from 'drizzle-orm/bun-sql';
import { relations } from './relations';
import { authRelations } from './auth.schema';
import { DATABASE_URL } from '$app/env/private';

if (!DATABASE_URL) throw new Error('DATABASE_URL is not set');

export const sql = new Bun.SQL({
	url: DATABASE_URL
});

export const db = drizzle({
	relations: { ...relations, ...authRelations },
	client: sql
});
