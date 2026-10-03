<script lang="ts">
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import type { Auth } from '#lib/server/auth.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import type { OAuthClient } from '@better-auth/oauth-provider';
	import {
		SIDEBAR_COOKIE_MAX_AGE,
		SIDEBAR_COOKIE_NAME,
		SIDEBAR_WIDTH,
		SIDEBAR_WIDTH_ICON
	} from './constants.js';
	import { setSidebar } from './context.svelte.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		open = $bindable(true),
		user,
		oauthClients,
		onOpenChange = () => {},
		class: className,
		style,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		open?: boolean;
		user: Auth['$Infer']['Session']['user'];
		oauthClients: OAuthClient[] | null;
		onOpenChange?: (open: boolean) => void;
	} = $props();

	const sidebar = setSidebar({
		open: () => open,
		user: () => user,
		oauthClients: () => oauthClients,
		setOpen: (value: boolean) => {
			open = value;
			onOpenChange(value);

			cookieStore.set({
				name: SIDEBAR_COOKIE_NAME,
				value: String(open),
				expires: Date.now() + SIDEBAR_COOKIE_MAX_AGE
			});
		}
	});
</script>

<svelte:window onkeydown={sidebar.handleShortcutKeydown} />

<Tooltip.Provider delayDuration={0}>
	<div
		data-slot="sidebar-wrapper"
		style="--sidebar-width: {SIDEBAR_WIDTH}; --sidebar-width-icon: {SIDEBAR_WIDTH_ICON}; {style}"
		class={cn(
			'group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar',
			className
		)}
		bind:this={ref}
		{...restProps}
	>
		{@render children?.()}
	</div>
</Tooltip.Provider>
