<script lang="ts" module>
	export { reasonSnippet };
</script>

<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Spinner } from '#lib/components/ui/spinner/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { refreshAll } from '$app/navigation';
	import type { ApplicationRequestSelectSchema } from '#lib/server/db/schema.js';
	import { processRequest } from '#lib/admin.remote';

	let {
		status,
		id,
		reviewer,
		process_reason
	}: {
		status: 'pending' | 'accepted' | 'rejected';
		id: string;
		reviewer: ApplicationRequestSelectSchema['reviewer'];
		process_reason: string | null;
	} = $props();

	let processWorking = $state(false);
	let processOpen = $state(false);
	let expectedAction = $state<'accept' | 'reject' | null>(null);

	const processApplication = async (action: 'accept' | 'reject') => {
		if (processWorking) return;
		processWorking = true;
		await processRequest({ id, accept: action === 'accept', reason: process_reason });
		processWorking = false;
		await refreshAll();
	};
</script>

{#snippet reasonSnippet({ reason }: { reason: string })}
	<span class="max-w-4xl text-sm wrap-break-word whitespace-normal">{reason}</span>
{/snippet}

{#if status === 'pending'}
	<Button
		onclick={() => {
			expectedAction = 'accept';
			processOpen = true;
		}}
		disabled={processWorking}
	>
		{#if processWorking}<Spinner />{/if}
		Accept
	</Button>
	<Button
		onclick={() => {
			expectedAction = 'reject';
			processOpen = true;
		}}
		variant="destructive"
		disabled={processWorking}
	>
		{#if processWorking}<Spinner />{/if}
		Reject
	</Button>
	<Dialog.Root bind:open={processOpen}>
		<Dialog.Content
			showCloseButton={!processWorking}
			onInteractOutside={(event) => {
				if (processWorking) event.preventDefault();
			}}
			onEscapeKeydown={(event) => {
				if (processWorking) event.preventDefault();
			}}
		>
			<form
				class="grid gap-4"
				onsubmit={(event) => {
					event.preventDefault();
					processApplication(expectedAction!);
				}}
			>
				<Dialog.Header>
					<Dialog.Title>Process Application Request</Dialog.Title>
					<Dialog.Description>They'll see what you put here</Dialog.Description>
				</Dialog.Header>
				<div class="grid gap-2">
					<Label for={`reason-${id}`}>Process reason</Label>
					<Textarea
						id={`reason-${id}`}
						bind:value={process_reason}
						required
						maxlength={2000}
						rows={5}
						disabled={processWorking}
						placeholder="Provide a reason for processing this application request. This will be visible to the applicant."
					/>
				</div>
				<Dialog.Footer>
					<Button
						type="button"
						variant="outline"
						disabled={processWorking}
						onclick={() => {
							processOpen = false;
						}}
					>
						Cancel
					</Button>
					<Button type="submit" disabled={processWorking || !process_reason?.trim()}>
						{#if processWorking}<Spinner />{/if}
						Process Request
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{:else if status === 'accepted'}
	<span class="max-w-1/16 text-sm wrap-break-word whitespace-normal text-primary">
		Accepted by {reviewer?.email || 'Unknown'}
		{#if process_reason}<p class="mt-1 whitespace-pre-wrap">{process_reason}</p>{/if}
	</span>
{:else if status === 'rejected'}
	<div class="text-sm wrap-break-word whitespace-normal text-destructive">
		<span>Rejected by {reviewer?.email || 'Unknown'}</span>
		{#if process_reason}<p class="mt-1 whitespace-pre-wrap">{process_reason}</p>{/if}
	</div>
{/if}
