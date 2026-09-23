<script lang="ts">
	import * as Form from '#lib/components/ui/form/index.js';
	import { FieldGroup, Field } from '#lib/components/ui/field/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
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

	const form = superForm(initialForm, {
		validators: zod4Client(formSchema)
	});

	const { form: formData, enhance } = form;
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
