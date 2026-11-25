import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { createSelectSchema } from 'drizzle-orm/zod';
import { z } from 'zod';
import * as auth from './auth.schema';

export const applicationRequests = pgTable('application_requests', {
	id: uuid('id').defaultRandom().primaryKey(),
	name: text('name').notNull(),
	createOrg: boolean('create_org').notNull().default(false),
	organizationName: text('organization_name'),
	organizationId: text('organization').references(() => auth.organization.id, {
		onDelete: 'set null'
	}),
	reason: text('reason').notNull(),
	uri: text('uri'),
	logo: text('logo'),
	scopes: text('scopes').notNull(),
	redirectUris: text('redirect_uris').array().notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => auth.user.id, { onDelete: 'cascade' }),
	reviewerId: text('reviewer').references(() => auth.user.id, { onDelete: 'set null' }),
	process_reason: text('process_reason'),
	status: text('status').notNull().default('pending'),
	created_at: timestamp('created_at').defaultNow(),
	updated_at: timestamp('updated_at').defaultNow()
});

export * from './auth.schema';

export const userSelectSchema = createSelectSchema(auth.user);

export const organizationSelectSchema = createSelectSchema(auth.organization);

export const applicationRequestSelectMinimalSchema = createSelectSchema(applicationRequests);

export const applicationRequestSelectSchema = z.object({
	...applicationRequestSelectMinimalSchema.shape,
	user: userSelectSchema,
	reviewer: userSelectSchema.nullable(),
	organization: organizationSelectSchema.optional()
});

export type ApplicationRequestSelectSchema = z.infer<typeof applicationRequestSelectSchema>;
