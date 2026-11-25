<script lang="ts">
	import * as Form from '#lib/components/ui/form/index.js';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { editApplicationSchema, type EditApplicationSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { untrack } from 'svelte';

	let {
		form: initialForm
	}: {
		form: SuperValidated<Infer<EditApplicationSchema>>;
	} = $props();

	const form = superForm(
		untrack(() => initialForm),
		{
			dataType: 'json',
			validators: zod4Client(editApplicationSchema)
		}
	);

	const { form: formData, enhance } = form;
</script>

<div class="flex flex-1 flex-col gap-4">
	<Card.Root class="container w-full flex-1 flex-col">
		<form method="POST" use:enhance>
			<Card.Header class="pb-6">
				<Card.Title>Edit Application: {$formData.name}</Card.Title>
			</Card.Header>
			<Card.Content>
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
			</Card.Content>
			<Card.Footer class="sm:justify-end">
				<Form.Button>Submit</Form.Button>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
