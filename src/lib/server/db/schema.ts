import { pgTable, uuid, text, boolean } from 'drizzle-orm/pg-core';
import * as auth from './auth.schema';

export const applicationRequests = pgTable('application_requests', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	createOrg: boolean('create_org').notNull().default(false),
	organizationId: text('organization').references(() => auth.organization.id, {
		onDelete: 'set null'
	}),
	uri: text('uri'),
	logo: text('logo'),
	scopes: text('scopes').notNull(),
	redirectUris: text('redirect_uris').array().notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => auth.user.id, { onDelete: 'cascade' })
});

export * from './auth.schema';
