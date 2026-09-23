<script lang="ts">
	import { browser } from '$app/env';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

{@render children?.()}
