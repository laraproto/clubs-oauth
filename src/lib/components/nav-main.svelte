<script lang="ts">
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import CirclePlusIcon from '@lucide/svelte/icons/circle-plus';
	import * as Collapsible from '#lib/components/ui/collapsible/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import type { Component } from 'svelte';
	import type { ResolvedPathname } from '$app/types';
	import { goto } from '$app/navigation';

	let {
		items
	}: {
		items: {
			title: string;
			url?: ResolvedPathname;
			icon: Component;
			isActive?: boolean;
			items?: {
				title: string;
				url: string;
			}[];
		}[];
	} = $props();
</script>

<Sidebar.Group>
	<Sidebar.GroupContent class="flex flex-col gap-2">
		<Sidebar.Menu>
			<Sidebar.MenuItem class="flex items-center gap-2">
				<Sidebar.MenuButton
					class="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
					tooltipContent="Create Application"
					onclick={() => {
						goto('/admin/applications', {
							state: {
								modal: true
							},
							shallow: false
						});
					}}
				>
					<CirclePlusIcon />
					<span>Create Application</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
			{#each items as mainItem (mainItem.title)}
				<Collapsible.Root open={mainItem.isActive}>
					{#snippet child({ props })}
						<Sidebar.MenuItem {...props}>
							<Sidebar.MenuButton tooltipContent={mainItem.title}>
								{#snippet child({ props })}
									<a href={mainItem.url} {...props}>
										<mainItem.icon />
										<span>{mainItem.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
							{#if mainItem.items?.length}
								<Collapsible.Trigger>
									{#snippet child({ props })}
										<Sidebar.MenuAction {...props} class="data-[state=open]:rotate-90">
											<ChevronRightIcon />
											<span class="sr-only">Toggle</span>
										</Sidebar.MenuAction>
									{/snippet}
								</Collapsible.Trigger>
								<Collapsible.Content>
									<Sidebar.MenuSub>
										{#each mainItem.items as subItem (subItem.title)}
											<Sidebar.MenuSubItem>
												<Sidebar.MenuSubButton href={subItem.url}>
													<span>{subItem.title}</span>
												</Sidebar.MenuSubButton>
											</Sidebar.MenuSubItem>
										{/each}
									</Sidebar.MenuSub>
								</Collapsible.Content>
							{/if}
						</Sidebar.MenuItem>
					{/snippet}
				</Collapsible.Root>
			{/each}
		</Sidebar.Menu>
	</Sidebar.GroupContent>
</Sidebar.Group>
