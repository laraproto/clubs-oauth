<script lang="ts" module>
	import FolderKanbanIcon from '@lucide/svelte/icons/folder-kanban';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import NotebookIcon from '@lucide/svelte/icons/notebook-pen';

	export const data: {
		navMain: ComponentProps<typeof NavMain>['items'];
		navAdmin: ComponentProps<typeof NavAdmin>['items'];
	} = {
		navMain: [
			{
				title: 'Dashboard',
				icon: LayoutDashboardIcon,
				url: '/developer/dashboard'
			},
			{
				title: 'Applications',
				icon: FolderKanbanIcon,
				url: '/developer/applications'
			}
		],
		navAdmin: [
			{
				title: 'Applications',
				icon: FolderKanbanIcon,
				url: '/developer/admin/applications'
			},
			{
				title: 'Requests',
				icon: NotebookIcon,
				url: '/developer/admin/requests'
			}
		]
	};
</script>

<script lang="ts">
	import CommandIcon from '@lucide/svelte/icons/command';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavMain from './nav-main.svelte';
	import NavProjects from './nav-app.svelte';
	import NavUser from './nav-user.svelte';
	import type { ComponentProps } from 'svelte';
	import { resolve } from '$app/paths';
	import NavAdmin from './nav-admin.svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href={resolve('/developer/dashboard')} {...props}>
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<CommandIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">Clubs OAuth</span>
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMain items={data.navMain} />
		{#if sidebar.user?.role === 'admin'}
			<NavAdmin items={data.navAdmin} />
		{/if}
		<NavProjects />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
