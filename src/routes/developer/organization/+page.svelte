<script lang="ts">
	import Head from '#lib/components/head.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import * as Sidebar from '#lib/components/ui/sidebar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Select from '#lib/components/ui/select/index.js';
	import { addMemberSchema } from './schema';
	import { superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { untrack } from 'svelte';
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let addMemberDialogOpen = $state(false);

	const roles = [
		{
			value: 'admin',
			label: 'Admin'
		},
		{
			value: 'member',
			label: 'Member (read-only)'
		}
	];

	const triggerContent = $derived(
		roles.find((f) => f.value === $formData.role)?.label ?? 'Select a role'
	);

	const form = superForm(
		untrack(() => data.addMemberForm),
		{
			dataType: 'json',
			validators: zod4Client(addMemberSchema),
			onResult({ result }) {
				if (result.type !== 'success') {
					return;
				}
				addMemberDialogOpen = false;
			}
		}
	);

	const { form: formData, enhance } = form;

	const sidebar = Sidebar.useSidebar();
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
						<Button class="w-full" href={resolve('/developer/organization/edit')} size="lg">
							Edit
						</Button>
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
											<!-- eslint-disable-next-line svelte/no-dupe-else-if-blocks -->
										{:else if member.userId == sidebar.user?.id && member.role !== 'owner'}
											<Button variant="destructive" size="sm">Leave</Button>
										{/if}
									</span>
								</div>
							</span>
						{/each}
						<Separator class="my-2" />
						<Button class="mt-2 w-full" onclick={() => (addMemberDialogOpen = true)}>
							Add Member
						</Button>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>

	<Dialog.Root bind:open={addMemberDialogOpen}>
		<Dialog.Content>
			<form action="?/addMember" method="POST" use:enhance>
				<div class="flex items-center gap-2 pt-4">
					<div class="grid flex-1 gap-2">
						<Form.Field {form} name="email">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Email</Form.Label>
									<Input {...props} bind:value={$formData.email} />
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
						<Form.Field {form} name="role">
							<Form.Control>
								{#snippet children({ props })}
									<Form.Label>Role</Form.Label>
									<Select.Root {...props} type="single" bind:value={$formData.role}>
										<Select.Trigger {...props} class="w-full">
											{triggerContent}
										</Select.Trigger>
										<Select.Content>
											<Select.Group>
												{#each roles as role (role.value)}
													<Select.Item value={role.value} label={role.label}>
														{role.label}
													</Select.Item>
												{/each}
												<Select.Item value="" label="Select a role" disabled>
													Select a role
												</Select.Item>
											</Select.Group>
										</Select.Content>
									</Select.Root>
								{/snippet}
							</Form.Control>
							<Form.FieldErrors />
						</Form.Field>
					</div>
				</div>
				<Dialog.Footer class="sm:justify-end">
					<Dialog.Close type="reset" class={buttonVariants()}>Close</Dialog.Close>
					<Form.Button>Submit</Form.Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
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
