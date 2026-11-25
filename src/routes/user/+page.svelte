<script lang="ts">
	import Head from '#lib/components/head.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import type { PageProps } from './$types';
	import ChangeEmail from './change-email.svelte';
	import VerifyEmailOtpDialog from './verify-email-otp-dialog.svelte';

	let { data }: PageProps = $props();

	let email = $state('');
</script>

<Head title="User" />

<div class="container mx-auto my-8 flex flex-col gap-4 px-4">
	<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
		<div class="flex flex-col gap-4 lg:col-span-1 lg:row-span-1">
			<Card.Root class="">
				<Card.Header>
					<Card.Title class="flex flex-row items-center">
						Hi {data.user.name.split(' ')[0]}!
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-2">
						<span class="text-sm font-medium text-muted-foreground">Club</span>
						<span class="text-sm">{data.user.clubName ?? 'You do not belong to a club'}</span>
						{#if data.user.clubName}
							<span class="text-sm font-medium text-muted-foreground">Role</span>
							<span class="text-sm">
								{data.user.clubRole
									? data.user.clubRole?.charAt(0).toUpperCase() + data.user.clubRole?.slice(1)
									: 'You do not have a role'}
							</span>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
		<div class="lg:col-span-2">
			<Card.Root class="h-full">
				<Card.Header>
					<Card.Title>Authorized Apps</Card.Title>
				</Card.Header>
				<Card.Content class="flex flex-col gap-2">To do</Card.Content>
			</Card.Root>
		</div>
		<div class="lg:col-span-1">
			<Card.Root class="h-full">
				<Card.Header>
					<Card.Title>Email</Card.Title>
					<Card.Description>
						Is your club membership located on another email? Change it here.
					</Card.Description>
				</Card.Header>
				<Card.Content class="flex flex-col gap-2">
					<ChangeEmail form={data.emailChangeForm} bind:email />
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>

<VerifyEmailOtpDialog form={data.verifyEmailOtpForm} {email} />
