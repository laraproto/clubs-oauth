<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '#lib/components/ui/sonner/index.js';
	import { getFlash } from 'sveltekit-flash-message';
	import { page } from '$app/state';
	import { toast } from 'svelte-sonner';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import favicon from '#lib/assets/favicon.svg';

	let { children } = $props();

	const flash = getFlash(page);

	$effect(() => {
		if (!$flash) return;

		if ($flash.type === 'success') {
			toast.success($flash.message);
		} else if ($flash.type === 'error') {
			toast.error($flash.message);
		} else if ($flash.type === 'info') {
			toast($flash.message);
		}

		// Clear the flash message to avoid double-toasting.
		$flash = undefined;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<ModeWatcher />
<Toaster />
<Tooltip.Provider>
	{@render children?.()}
</Tooltip.Provider>
