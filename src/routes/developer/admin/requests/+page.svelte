<script lang="ts">
	import Head from '#lib/components/head.svelte';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import AdminTable from '#lib/components/tables/admin-table.svelte';
	import { columns } from '#lib/components/tables/application-requests-table.js';
	import { getAppRequests } from '../data.remote';
	import type { PaginationState } from '@tanstack/svelte-table';

	let applicationRequestsList = $derived(await getAppRequests({}));
	let page = $state(0);
	let pageSize = $state(10);
	let searchQuery = $state('');

	$effect(() => {
		getAppRequests({ page: page + 1, limit: pageSize, query: searchQuery }).then((data) => {
			applicationRequestsList = data;
		});
	});

	const onPageChange = (pagination: PaginationState) => {
		page = pagination.pageIndex;
		pageSize = pagination.pageSize;
	};
</script>

<Head title="Admin Application Requests" />

<div class="flex flex-1 flex-col gap-4">
	<h3 class="text-lg font-medium">
		Pending applications ({applicationRequestsList.pending.length})
	</h3>
	<AdminTable
		data={applicationRequestsList.pending}
		{columns}
		isManualPagination={false}
		shouldShowSearchInput={false}
	/>
	<Separator class="my-4" />
	<h3 class="text-lg font-medium">All applications</h3>
	<AdminTable
		data={applicationRequestsList.all}
		{columns}
		{onPageChange}
		bind:searchQuery
		pageCount={applicationRequestsList.pageCount}
		rowCount={applicationRequestsList.count}
		isManualPagination={true}
	/>
</div>
