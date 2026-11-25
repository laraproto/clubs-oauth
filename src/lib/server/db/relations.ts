import { defineRelations } from 'drizzle-orm';
import * as authSchema from './auth.schema';
import * as schema from './schema';

export const relations = defineRelations({ ...schema, ...authSchema }, (r) => ({
	applicationRequests: {
		user: r.one.user({
			from: r.applicationRequests.userId,
			to: r.user.id
		}),
		reviewer: r.one.user({
			from: r.applicationRequests.reviewerId,
			to: r.user.id
		}),
		organization: r.one.organization({
			from: r.applicationRequests.organizationId,
			to: r.organization.id
		})
	},
	oauthClient: {
		organization: r.one.organization({
			from: r.oauthClient.referenceId,
			to: r.organization.id
		})
	}
}));
