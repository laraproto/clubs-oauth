<script lang="ts" module>
	import FolderKanbanIcon from '@lucide/svelte/icons/folder-kanban';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';

	export const data: {
		navMain: ComponentProps<typeof NavMain>['items'];
	} = {
		navMain: [
			{
				title: 'Dashboard',
				icon: LayoutDashboardIcon,
				url: '/admin/dashboard'
			},
			{
				title: 'Applications',
				icon: FolderKanbanIcon,
				url: '/admin/applications'
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

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/admin/overview" {...props}>
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
		<NavProjects />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
