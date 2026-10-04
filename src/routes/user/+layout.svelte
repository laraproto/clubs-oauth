<script lang="ts">
	import UserHeader from '#lib/components/user-header.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="[--header-height:calc(--spacing(14))]">
	<UserHeader admin={data.user.role === 'admin'} />
	<div class="mx-auto flex w-full max-w-4xl flex-1 flex-col py-4 md:px-0">
		{@render children?.()}
	</div>
</div>
