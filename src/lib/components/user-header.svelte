<script lang="ts">
	import * as NavigationMenu from '#lib/components/ui/navigation-menu/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	//import { navigationMenuTriggerStyle } from '#lib/components/ui/navigation-menu/navigation-menu-trigger.svelte';
	import { resolve } from '$app/paths';
	import ConfirmDialog from './confirm-dialog.svelte';
	import { signout } from '#lib/auth.remote';
	import { goto } from '$app/navigation';

	let { admin }: { admin: boolean } = $props();

	let logoutConfirmDialog = $state(false);
</script>

<header class="sticky top-0 z-50 flex w-full items-center border-b bg-background">
	<div class="flex h-(--header-height) w-full items-center gap-2 px-4">
		<span class="font-bold">Clubs OAuth</span>
		<NavigationMenu.Root>
			<NavigationMenu.List></NavigationMenu.List>
		</NavigationMenu.Root>
		<div class="w-full sm:ms-auto sm:w-auto">
			<Button
				variant="outline"
				onclick={() => {
					logoutConfirmDialog = true;
				}}
			>
				Logout
			</Button>
			{#if admin}
				<Button href={resolve('/admin/dashboard')}>Admin</Button>
			{/if}
		</div>
	</div>
</header>

<ConfirmDialog
	bind:open={logoutConfirmDialog}
	title="Are you sure you want to log out?"
	description="You will be logged out of your current session."
	onConfirm={async () => {
		await signout();
		logoutConfirmDialog = false;
		await goto(resolve('/auth/signin'), {
			refreshAll: true
		});
	}}
/>
