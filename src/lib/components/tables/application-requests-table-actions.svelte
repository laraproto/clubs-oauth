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
		status: 'pending' | 'approved' | 'rejected';
		id: string;
		reviewer: ApplicationRequestSelectSchema['reviewer'];
		process_reason: string | null;
	} = $props();

	let processWorking = $state(false);
	let rejectOpen = $state(false);
	let reason = $state('');

	const processApplication = async (action: 'approve' | 'reject') => {
		if (processWorking) return;
		processWorking = true;
		await processRequest({ id, accept: action === 'approve', reason: process_reason });
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
			processApplication('approve');
		}}
		disabled={processWorking}
	>
		{#if processWorking}<Spinner />{/if}
		Approve
	</Button>
	<Button
		onclick={() => {
			rejectOpen = true;
		}}
		variant="destructive"
		disabled={processWorking}
	>
		{#if processWorking}<Spinner />{/if}
		Reject
	</Button>
	<Dialog.Root bind:open={rejectOpen}>
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
					processApplication('reject');
				}}
			>
				<Dialog.Header>
					<Dialog.Title>Reject application</Dialog.Title>
					<Dialog.Description>They'll see what you put here</Dialog.Description>
				</Dialog.Header>
				<div class="grid gap-2">
					<Label for={`rejection-reason-${id}`}>Rejection reason</Label>
					<Textarea
						id={`rejection-reason-${id}`}
						bind:value={reason}
						required
						maxlength={2000}
						rows={5}
						disabled={processWorking}
						placeholder="ur username bad"
					/>
				</div>
				<Dialog.Footer>
					<Button
						type="button"
						variant="outline"
						disabled={processWorking}
						onclick={() => {
							rejectOpen = false;
						}}
					>
						Cancel
					</Button>
					<Button type="submit" variant="destructive" disabled={processWorking || !reason.trim()}>
						{#if processWorking}<Spinner />{/if}
						Reject and send email
					</Button>
				</Dialog.Footer>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{:else if status === 'approved'}
	<span class="max-w-1/16 text-sm wrap-break-word whitespace-normal text-primary">
		Approved by {typeof reviewer === 'string' ? reviewer : reviewer?.email}
		{#if process_reason}<p class="mt-1 whitespace-pre-wrap">{process_reason}</p>{/if}
	</span>
{:else if status === 'rejected'}
	<div class="text-sm wrap-break-word whitespace-normal text-destructive">
		<span>Rejected by {typeof reviewer === 'string' ? reviewer : reviewer?.email}</span>
		{#if process_reason}<p class="mt-1 whitespace-pre-wrap">{process_reason}</p>{/if}
	</div>
{/if}
