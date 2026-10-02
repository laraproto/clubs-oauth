<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import type { Component } from 'svelte';

	let {
		apps
	}: {
		apps: {
			name: string;
			url: string;
			icon: Component;
		}[];
	} = $props();
</script>

<Sidebar.Group class="group-data-[collapsible=icon]:hidden">
	<Sidebar.GroupLabel>Applications</Sidebar.GroupLabel>
	<Sidebar.GroupContent class="flex flex-col gap-2">
		<Sidebar.Menu>
			{#each apps as item (item.name)}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						{#snippet child({ props })}
							<a href={item.url} {...props}>
								<item.icon />
								<span>{item.name}</span>
							</a>
						{/snippet}
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/each}
			{#if apps.length === 0}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						<span>No Applications</span>
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/if}
			{#if apps.length > 4}
				<Sidebar.MenuItem>
					<Sidebar.MenuButton>
						<EllipsisIcon />
						<span>More</span>
					</Sidebar.MenuButton>
				</Sidebar.MenuItem>
			{/if}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
