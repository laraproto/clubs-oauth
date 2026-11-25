<script lang="ts">
	import * as Form from '#lib/components/ui/form/index.js';
	import { FieldGroup, Field } from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import { emailChangeSchema, type EmailChangeSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '#lib/utils';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';

	let {
		ref = $bindable(null),
		class: className,
		form: initialForm,
		email = $bindable(''),
		...restProps
	}: WithElementRef<HTMLFormAttributes> & {
		form: SuperValidated<Infer<EmailChangeSchema>>;
		email: string;
	} = $props();

	const form = superForm(
		untrack(() => initialForm),
		{
			validators: zod4Client(emailChangeSchema),
			onUpdate({ form }) {
				if (!form.valid) {
					return;
				}
				email = form.data.email;
			},
			onResult({ result }) {
				if (result.type !== 'success') {
					email = '';
					return;
				}
				// eslint-disable-next-line
				goto('', {
					state: {
						modal: true
					},
					shallow: true
				});
			}
		}
	);

	const { form: formData, errors, message, enhance } = form;
</script>

<form
	class={cn('flex flex-col gap-6', className)}
	bind:this={ref}
	action="?/changeEmail"
	method="POST"
	use:enhance
	{...restProps}
>
	<FieldGroup>
		{#if $errors._errors || $message}
			<Alert.Root variant={$errors._errors ? 'destructive' : 'default'} class="mb-4">
				{#if $errors._errors}<AlertCircleIcon />
				{:else}
					<CheckCircle2Icon />
				{/if}
				<Alert.Description>
					<ul class="list-inside list-disc text-sm">
						{#each $errors._errors as error (error)}
							<li>{error}</li>
						{/each}
						{#if $message}
							<li>{$message}</li>
						{/if}
					</ul>
				</Alert.Description>
			</Alert.Root>
		{/if}
		<Form.Field {form} name="email">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label>Email</Form.Label>
					<Input {...props} bind:value={$formData.email} />
				{/snippet}
			</Form.Control>
			<Form.FieldErrors />
		</Form.Field>
		<Field>
			<Form.Button type="submit">Change Email</Form.Button>
		</Field>
	</FieldGroup>
</form>
