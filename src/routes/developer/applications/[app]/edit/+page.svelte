<script lang="ts">
	import Head from '#lib/components/head.svelte';
	import type { PageProps } from './$types';
	import EditApplication from './edit-application.svelte';

	let { data }: PageProps = $props();
</script>

<Head title={`Application Edit: ${data.app?.client_name || 'Not Found'}`} />

<div class="flex flex-1 items-center justify-center">
	<EditApplication form={data.editApplicationForm} />
</div>
