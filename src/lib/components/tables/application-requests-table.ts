import { createColumnHelper, renderComponent, renderSnippet } from '@tanstack/svelte-table';
import type { DataTableFeatures } from './admin-table-features.js';
import ApplicationsTableActions, {
	reasonSnippet
} from './application-requests-table-actions.svelte';
import type { ApplicationRequestSelectSchema } from '#lib/server/db/schema.js';

const columnHelper = createColumnHelper<DataTableFeatures, ApplicationRequestSelectSchema>();

export const columns = columnHelper.columns([
	columnHelper.accessor('user.email', {
		header: 'Email'
	}),
	columnHelper.accessor((row) => row.user.name, {
		header: 'Name'
	}),
	columnHelper.accessor('reason', {
		cell: ({ row }) => {
			return renderSnippet(reasonSnippet, {
				reason: row.original.reason
			});
		},
		header: 'Reason'
	}),
	columnHelper.accessor('created_at', {
		cell: (info) => info.getValue()?.toDateString(),
		header: 'Submitted'
	}),
	columnHelper.display({
		id: 'actions',
		cell: ({ row }) => {
			return renderComponent(ApplicationsTableActions, {
				id: row.original.id,
				reviewer: row.original.reviewer,
				process_reason: row.original.process_reason,
				status: row.original.status as 'pending' | 'approved' | 'rejected'
			});
		},
		header: 'Actions'
	})
]);
