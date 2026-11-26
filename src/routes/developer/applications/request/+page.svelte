<script lang="ts">
	import Head from '#lib/components/head.svelte';
	import type { PageProps } from './$types';
	import CreateRequest from './create-request.svelte';

	let { data }: PageProps = $props();
</script>

<Head title="Create Application Request" />

<div class="flex flex-1 items-center justify-center">
	<CreateRequest form={data.requestForm} />
</div>
