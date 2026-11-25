<script lang="ts">
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { buttonVariants } from '#lib/components/ui/button/index.js';
	import { page } from '$app/state';
	import { createRequestSchema, type CreateRequestSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { untrack } from 'svelte';

	let {
		form: initialForm
	}: {
		form: SuperValidated<Infer<CreateRequestSchema>>;
	} = $props();

	const form = superForm(
		untrack(() => initialForm),
		{
			dataType: 'json',
			validators: zod4Client(createRequestSchema)
		}
	);

	const { form: formData, enhance } = form;
</script>

<Dialog.Root
	open={page.state?.modal}
	onOpenChangeComplete={(open) => {
		if (!open) history.back();
	}}
>
	<Dialog.Content class="sm:max-w-md">
		<form method="POST" use:enhance>
			<Dialog.Header class="pb-6">
				<Dialog.Title>New Application Request</Dialog.Title>
			</Dialog.Header>
			<div class="flex items-center gap-2">
				<div class="grid flex-1 gap-2">
					<Form.Field {form} name="name">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Name</Form.Label>
								<Input {...props} bind:value={$formData.name} />
							{/snippet}
						</Form.Control>
						<Form.Description>Application name to show on consent page.</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="uri">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>URI</Form.Label>
								<Input {...props} bind:value={$formData.uri} />
							{/snippet}
						</Form.Control>
						<Form.Description>Optional URI to link back to application.</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="logo">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Logo</Form.Label>
								<Input {...props} bind:value={$formData.logo} />
							{/snippet}
						</Form.Control>
						<Form.Description>Optional logo to show on consent page.</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="scopes">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Scopes</Form.Label>
								<Input {...props} bind:value={$formData.scopes} />
							{/snippet}
						</Form.Control>
						<Form.Description>Enter one or more scopes, separated by spaces.</Form.Description>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="redirectUris">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>Redirect URIs</Form.Label>
								<Textarea
									{...props}
									class="break-all"
									value={$formData.redirectUris.join('\n')}
									onchange={(e) => {
										if (!(e.target instanceof HTMLTextAreaElement)) return;
										const redirectArray = e.target.value.split('\n').filter((v) => v.trim() !== '');
										$formData.redirectUris = redirectArray;
									}}
								/>
							{/snippet}
						</Form.Control>
						<Form.Description>
							Enter one or more redirect URIs, separated by new lines.
						</Form.Description>
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
