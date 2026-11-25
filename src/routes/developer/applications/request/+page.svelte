<script lang="ts">
	import type { PageProps } from './$types';
	import CreateRequest from './create-request.svelte';

	let { data }: PageProps = $props();
</script>

<div class="flex flex-1 items-center justify-center">
	<CreateRequest form={data.requestForm} />
</div>
