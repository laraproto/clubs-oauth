<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { resolve } from '$app/paths';

	const sidebar = Sidebar.useSidebar();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Applications</Sidebar.GroupLabel>
	<Sidebar.GroupContent class="flex flex-col gap-2">
		<Sidebar.Menu>
			{#each sidebar.oauthClients?.slice(0, 4) || [] as item (item.client_name)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a
								href={resolve('/admin/applications/[app]', {
									app: item.client_id
								})}
								{...props}
							>
								<span>{item.client_name}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
			{#if sidebar.oauthClients?.length === 0}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						<span>No Applications</span>
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/if}
			{#if sidebar.oauthClients && sidebar.oauthClients?.length > 4}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href={resolve('/admin/applications')} {...props}>
								<EllipsisIcon />
								<span>More</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/if}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
