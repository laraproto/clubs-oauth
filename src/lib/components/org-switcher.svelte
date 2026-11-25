<script lang="ts">
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import CommandIcon from '@lucide/svelte/icons/command';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { setActiveOrganization } from '#lib/auth.remote';
	import { refreshAll } from '$app/navigation';
	const sidebar = Sidebar.useSidebar();
	let activeOrg = $derived(
		sidebar.organizations?.find((org) => org.id === sidebar.session?.activeOrganizationId) ?? null
	);
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						{...props}
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
					>
						{#if activeOrg}
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground"
							>
								{#if activeOrg.logo}
									<img src={activeOrg.logo} alt="logo" class="size-8 rounded-md" />
								{:else}
									<Avatar.Root class="size-8 rounded-lg">
										<Avatar.Image alt={activeOrg?.name?.charAt(0).toUpperCase()} />
										<Avatar.Fallback>{activeOrg?.name?.charAt(0).toUpperCase()}</Avatar.Fallback>
									</Avatar.Root>
								{/if}
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">
									{activeOrg.name}
								</span>
							</div>
						{:else}
							<div
								class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
							>
								<CommandIcon class="size-4" />
							</div>
							<div class="grid flex-1 text-start text-sm leading-tight">
								<span class="truncate font-medium">Select Organization</span>
							</div>
						{/if}
						<ChevronsUpDownIcon class="ms-auto" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content
				class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
				align="start"
				side={sidebar.isMobile ? 'bottom' : 'right'}
				sideOffset={4}
			>
				<DropdownMenu.Label class="text-xs text-muted-foreground">Organizations</DropdownMenu.Label>
				{#each sidebar.organizations as organization (organization.name)}
					<DropdownMenu.Item
						onSelect={async () => {
							await setActiveOrganization(organization.id);
							await refreshAll();
						}}
						class="gap-2 p-2"
					>
						<div class="flex size-6 items-center justify-center rounded-md border">
							{#if organization.logo}
								<img src={organization.logo} alt="logo" class="size-8 rounded-md" />
							{:else}
								<Avatar.Root class="size-8 rounded-lg">
									<Avatar.Image alt={organization?.name?.charAt(0).toUpperCase()} />
									<Avatar.Fallback>{organization?.name?.charAt(0).toUpperCase()}</Avatar.Fallback>
								</Avatar.Root>
							{/if}
						</div>
						{organization.name}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>
