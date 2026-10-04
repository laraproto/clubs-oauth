<script lang="ts">
	import Head from '#lib/components/head.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Tooltip from '#lib/components/ui/tooltip/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import LinkIcon from '@lucide/svelte/icons/link';
	import type { PageProps } from './$types';
	import { deleteApp, revokeAuthorization, rotateClientSecret } from './data.remote';
	import ConfirmDialog from '#lib/components/confirm-dialog.svelte';

	let { data }: PageProps = $props();

	let dialogState = $state({
		resetClientSecretDialogOpen: false,
		revokeAccessTokensDialogOpen: false,
		deleteApplicationDialogOpen: false
	});

	let newClientSecret = $state<string | null>(null);
</script>

<Head title={`Admin Application: ${data.app?.name}`} />

{#if data.app}
	<div class="container mx-auto my-8 flex flex-col gap-4 px-4">
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<div class="flex flex-col gap-4 lg:col-span-1 lg:row-span-2 lg:gap-8">
				<Card.Root class="relative mx-auto w-full max-w-sm pt-0">
					<div class="absolute inset-0 z-15 aspect-video bg-black/35"></div>
					<img
						src={data.app.icon || 'https://placehold.co/600x400?text=No+Image'}
						alt={data.app.name}
						class="relative z-20 aspect-video w-full object-cover"
					/>
					<Card.Header>
						<Card.Title class="flex flex-row items-center">
							{data.app.name}
							{#if data.app.uri}
								<a href={data.app.uri}
									><LinkIcon
										class="ml-2 size-4 text-muted-foreground hover:cursor-pointer hover:text-primary"
									/></a
								>
							{/if}
						</Card.Title>
					</Card.Header>
					<Card.Footer>
						<span class="flex flex-row items-center">
							<Avatar.Root class="size-6 rounded-lg">
								<Avatar.Image
									src={data.app.user?.image}
									alt={data.app.user?.name?.charAt(0).toUpperCase()}
								/>
								<Avatar.Fallback>{data.app.user?.name?.charAt(0).toUpperCase()}</Avatar.Fallback>
							</Avatar.Root>
							<span class="ml-2 text-sm font-medium">{data.app.user?.name.split(' ')[0]}</span>
						</span>
					</Card.Footer>
				</Card.Root>
				<span class="flex justify-center">
					<Button class="w-full">Edit App</Button>
				</span>
			</div>
			<div class="lg:col-span-2">
				<Card.Root class="h-full">
					<Card.Header>
						<Card.Title>Application Details</Card.Title>
					</Card.Header>
					<Card.Content class="flex flex-col gap-2">
						<span class="flex flex-col gap-2">
							<p>Client ID</p>
							{let copied = $state(false)}
							<Tooltip.Root
								onOpenChangeComplete={() => (copied = false)}
								disableCloseOnTriggerClick
							>
								<Tooltip.Trigger
									onclick={() => {
										navigator.clipboard.writeText(data.app?.clientId || '');
										copied = true;
									}}
									class="max-w-fit rounded-md bg-muted p-2"
								>
									<code>{data.app?.clientId}</code>
								</Tooltip.Trigger>
								<Tooltip.Content>
									{#if copied}
										Copied!
									{:else}
										Click to copy Client ID
									{/if}
								</Tooltip.Content>
							</Tooltip.Root>
						</span>
						<span class="flex flex-col gap-2">
							<p>Client Secret</p>
							{let copied = $state(false)}
							{#if newClientSecret}
								<Tooltip.Root
									onOpenChangeComplete={() => (copied = false)}
									disableCloseOnTriggerClick
								>
									<Tooltip.Trigger
										onclick={() => {
											navigator.clipboard.writeText(newClientSecret!);
											copied = true;
										}}
										class="max-w-fit rounded-md bg-muted p-2"
									>
										<code>{newClientSecret}</code>
									</Tooltip.Trigger>
									<Tooltip.Content>
										{#if copied}
											Copied!
										{:else}
											Click to copy Client Secret
										{/if}
									</Tooltip.Content>
								</Tooltip.Root>
							{:else}
								<Button
									class="max-w-fit"
									onclick={() => (dialogState.resetClientSecretDialogOpen = true)}
									>Regenerate Client Secret</Button
								>
							{/if}
						</span>
					</Card.Content>
				</Card.Root>
			</div>
			<div class="lg:col-span-2">
				<Card.Root class="h-full">
					<Card.Header>
						<Card.Title>Redirect URIs</Card.Title>
					</Card.Header>
					<Card.Content>
						{#each data.app.redirectUris as redirectUri (redirectUri)}
							<div class="flex flex-row items-center justify-between gap-2 rounded-md bg-muted p-2">
								{let copied = $state(false)}
								<Tooltip.Root
									onOpenChangeComplete={() => (copied = false)}
									disableCloseOnTriggerClick
								>
									<Tooltip.Trigger
										onclick={() => {
											navigator.clipboard.writeText(redirectUri);
											copied = true;
										}}
										class="max-w-fit truncate rounded-md bg-muted p-2"
									>
										<code>{redirectUri}</code>
									</Tooltip.Trigger>
									<Tooltip.Content>
										{#if copied}
											Copied!
										{:else}
											Click to copy Redirect URI
										{/if}
									</Tooltip.Content>
								</Tooltip.Root>
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
			</div>
			<div class="lg:col-span-1">
				<Card.Root class="h-full border border-destructive bg-destructive/20">
					<Card.Header>
						<Card.Title>Danger Zone</Card.Title>
					</Card.Header>
					<Card.Content>
						<Button
							variant="destructive"
							class="w-full"
							onclick={() => (dialogState.revokeAccessTokensDialogOpen = true)}
							>Revoke Access Tokens</Button
						>
						<Button
							variant="destructive"
							class="mt-2 w-full"
							onclick={() => (dialogState.deleteApplicationDialogOpen = true)}
							>Delete Application</Button
						>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
{/if}

<ConfirmDialog
	bind:open={dialogState.resetClientSecretDialogOpen}
	variant="destructive"
	title="Regenerate Client Secret"
	description="Are you sure you want to invalidate the client secret? It will be invalidated immediately."
	onConfirm={async () => {
		const result = await rotateClientSecret(data.app?.clientId || '');
		newClientSecret = result || null;
		dialogState.resetClientSecretDialogOpen = false;
	}}
/>

<ConfirmDialog
	bind:open={dialogState.revokeAccessTokensDialogOpen}
	variant="destructive"
	title="Revoke Access Tokens"
	description="Are you sure you want to revoke all access tokens for this application? This action cannot be undone."
	onConfirm={async () => {
		await revokeAuthorization(data.app?.clientId || '');
		dialogState.revokeAccessTokensDialogOpen = false;
	}}
/>

<ConfirmDialog
	bind:open={dialogState.deleteApplicationDialogOpen}
	variant="destructive"
	title="Delete Application"
	description="Are you sure you want to delete this application? This action cannot be undone."
	onConfirm={async () => {
		await deleteApp(data.app?.clientId || '');
		dialogState.deleteApplicationDialogOpen = false;
	}}
/>
