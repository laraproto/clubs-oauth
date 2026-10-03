<script lang="ts">
	import * as Breadcrumb from '#lib/components/ui/breadcrumb/index.js';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import AppSidebar from '#lib/components/app-sidebar.svelte';
	import { page } from '$app/state';
	import { getApp } from './data.remote';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const slugMap = {
		'[app]': {
			getPath: async () =>
				page.params.app
					? data.oauthClients?.find((item) => item.client_id === page.params.app)?.client_name ||
						(await getApp(page.params.app))?.name ||
						'Not Found'
					: 'Not Found',
			getList: async () =>
				data.oauthClients?.map((item) => ({
					slug: item.client_id,
					name: item.client_name || item.client_id
				})) || []
		}
	};
</script>

<Sidebar.Provider oauthClients={data.oauthClients} user={data.user} open={data.sidebarOpen}>
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
									{#if slugMap[segment as keyof typeof slugMap]}
										{@const name = await slugMap[segment as keyof typeof slugMap].getPath()}
										{#if (await slugMap[segment as keyof typeof slugMap].getList) && (await slugMap[segment as keyof typeof slugMap].getList()).length > 1}
											<DropdownMenu.Root>
												<DropdownMenu.Trigger class="flex items-center gap-1">
													{name}
													<ChevronDownIcon data-icon="inline-end" class="size-3.5" />
												</DropdownMenu.Trigger>
												<DropdownMenu.Content align="start">
													<DropdownMenu.Group>
														{#each await slugMap[segment as keyof typeof slugMap].getList() as item (item.slug)}
															<DropdownMenu.Item>
																{#snippet child({ props })}
																	<a
																		href={'/' +
																			segments.slice(0, index).join('/') +
																			'/' +
																			item.slug}
																		{...props}
																	>
																		{item.name}
																	</a>
																{/snippet}
															</DropdownMenu.Item>
														{/each}
													</DropdownMenu.Group>
												</DropdownMenu.Content>
											</DropdownMenu.Root>
										{:else}
											<Breadcrumb.Page>{name}</Breadcrumb.Page>
										{/if}
									{:else}
										<Breadcrumb.Page
											>{segment.slice(0, 1).toUpperCase() + segment.slice(1)}</Breadcrumb.Page
										>
									{/if}
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
