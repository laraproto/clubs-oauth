<script lang="ts">
	import * as Breadcrumb from '#lib/components/ui/breadcrumb/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import AppSidebar from '#lib/components/app-sidebar.svelte';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<Sidebar.Provider user={data.user} open={data.sidebarOpen}>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2">
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ms-1" />
				<Separator orientation="vertical" class="me-2 data-vertical:h-4 data-vertical:self-auto" />
				<Breadcrumb.Root>
					{@const segments = page.route.id?.split('/').filter(Boolean) || ['admin']}
					<Breadcrumb.List>
						{#each segments as segment, index (index)}
							{@const isLast = index === segments.length - 1}
							<Breadcrumb.Item class="hidden md:block">
								{#if !isLast}
									<Breadcrumb.Link href={'/' + segments.slice(0, index + 1).join('/')}>
										{segment.slice(0, 1).toUpperCase() + segment.slice(1)}
									</Breadcrumb.Link>
								{:else}
									<Breadcrumb.Page
										>{segment.slice(0, 1).toUpperCase() + segment.slice(1)}</Breadcrumb.Page
									>
								{/if}
							</Breadcrumb.Item>

							{#if !isLast}
								<Breadcrumb.Separator class="hidden md:block" />
							{/if}
						{/each}
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
			{@render children?.()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
