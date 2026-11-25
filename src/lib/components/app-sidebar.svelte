<script lang="ts" module>
	import FolderKanbanIcon from '@lucide/svelte/icons/folder-kanban';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import UserGroupIcon from '@lucide/svelte/icons/user-group';
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
				title: 'Organization',
				icon: UserGroupIcon,
				url: '/developer/organization'
			},
			{
				title: 'Applications',
				icon: FolderKanbanIcon,
				url: '/developer/applications'
			}
		],
		navAdmin: [
			{
				title: 'Dashboard',
				icon: LayoutDashboardIcon,
				url: '/developer/admin/dashboard'
			},
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
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import NavMain from './nav-main.svelte';
	import NavProjects from './nav-app.svelte';
	import NavUser from './nav-user.svelte';
	import type { ComponentProps } from 'svelte';
	import NavAdmin from './nav-admin.svelte';
	import OrgSwitcher from './org-switcher.svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<OrgSwitcher />
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
