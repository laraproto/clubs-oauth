<script lang="ts">
	import * as Form from '#lib/components/ui/form/index.js';
	import { FieldGroup, Field } from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Alert from '#lib/components/ui/alert/index.js';
	import AlertCircleIcon from '@lucide/svelte/icons/alert-circle';
	import CheckCircle2Icon from '@lucide/svelte/icons/check-circle-2';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import type { HTMLFormAttributes } from 'svelte/elements';
	import { cn, type WithElementRef } from '#lib/utils';
	import { zod4Client } from 'sveltekit-superforms/adapters';

	let {
		ref = $bindable(null),
		class: className,
		form: initialForm,
		...restProps
	}: WithElementRef<HTMLFormAttributes> & { form: SuperValidated<Infer<FormSchema>> } = $props();

	// svelte-ignore state_referenced_locally
	const form = superForm(initialForm, {
		validators: zod4Client(formSchema)
	});

	const { form: formData, errors, message, enhance } = form;
</script>

<form
	class={cn('flex flex-col gap-6', className)}
	bind:this={ref}
	method="POST"
	use:enhance
	{...restProps}
>
	<FieldGroup>
		<div class="flex flex-col items-center gap-1 text-center">
			<h1 class="text-2xl font-bold">Club Member Login</h1>
			<p class="text-sm text-balance text-muted-foreground">Sign in with your club email</p>
		</div>
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
			<Form.Description>Type your club email here.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
		<Field>
			<Form.Button type="submit">Login</Form.Button>
		</Field>
	</FieldGroup>
</form>
