<script lang="ts">
	import Head from '#lib/components/head.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Head title="Organization" />

{#if data.organization}
	<div class="container mx-auto my-8 flex flex-col gap-4 px-4">
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<div class="flex flex-col gap-4 lg:col-span-1 lg:row-span-2">
				<Card.Root class="relative mx-auto w-full pt-0">
					<div class="absolute inset-0 z-15 aspect-video bg-black/35"></div>
					<img
						src={data.organization?.logo || 'https://placehold.co/600x400?text=No+Image'}
						alt={data.organization?.name}
						class="relative z-20 aspect-video w-full object-cover"
					/>
					<Card.Header>
						<Card.Title class="flex flex-row items-center">
							{data.organization?.name}
						</Card.Title>
					</Card.Header>
					<Card.Footer>
						<span class="ml-auto text-sm font-medium text-muted-foreground">
							<Button variant="outline" href={resolve('/developer/organization/edit')} size="sm">
								Edit
							</Button>
						</span>
					</Card.Footer>
				</Card.Root>
			</div>
			<div class="lg:col-span-2">
				<Card.Root class="h-full">
					<Card.Header>
						<Card.Title>Members</Card.Title>
					</Card.Header>
					<Card.Content>
						{#each data.memberData?.members as member (member.id)}
							<span class="flex flex-row items-center py-4">
								<Avatar.Root class="size-6 rounded-lg">
									<Avatar.Image
										src={member.user.image}
										alt={member.user.name?.charAt(0).toUpperCase()}
									/>
									<Avatar.Fallback>{member.user.name?.charAt(0).toUpperCase()}</Avatar.Fallback>
								</Avatar.Root>
								<div class="flex flex-1 items-center justify-between gap-2">
									<span>
										<span class="ml-2 text-sm font-medium">{member.user.name.split(' ')[0]}</span>
										<span class="text-muted-foreground">({member.user.email})</span>
									</span>
									<span class="block">
										<span class="text-muted-foreground">
											{member.role.charAt(0).toUpperCase() + member.role.slice(1)}
										</span>
										{#if member.role !== 'owner'}
											<Button variant="destructive" size="sm">Remove</Button>
										{/if}
									</span>
								</div>
							</span>
						{/each}
						<Separator class="my-2" />
						<Button class="mt-2 w-full">Add Member</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
{:else}
	<div class="container mx-auto my-8 flex flex-col gap-4 px-4">
		<Card.Root class="mx-auto w-full max-w-sm">
			<Card.Header>
				<Card.Title>Organization Not Found</Card.Title>
			</Card.Header>
			<Card.Content>Select or create an organization to access the organization page.</Card.Content>
		</Card.Root>
	</div>
{/if}
