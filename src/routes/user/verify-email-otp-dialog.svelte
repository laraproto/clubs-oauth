<script lang="ts">
	import * as Form from '#lib/components/ui/form/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import { emailChangeOtpSchema, type EmailChangeOtpSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { page } from '$app/state';
	import { zod4Client } from 'sveltekit-superforms/adapters';
	import { onMount, untrack } from 'svelte';
	import { buttonVariants } from '#lib/components/ui/button/index.js';
	import { goto } from '$app/navigation';

	let {
		form: initialForm,
		email
	}: {
		form: SuperValidated<Infer<EmailChangeOtpSchema>>;
		email: string;
	} = $props();

	const form = superForm(
		untrack(() => initialForm),
		{
			dataType: 'json',
			validators: zod4Client(emailChangeOtpSchema),
			onSubmit({ formData }) {
				formData.set('email', email);
			},
			onUpdate({ form }) {
				form.data.email = email;
			},
			onResult({ result }) {
				if (result.type !== 'success') {
					return;
				}
				// eslint-disable-next-line
				goto('', {
					state: {
						modal: false
					},
					shallow: true
				});
			}
		}
	);

	const { form: formData, enhance } = form;

	onMount(() => {
		$formData.email = email;
	});
</script>

<Dialog.Root
	open={page.state.modal}
	onOpenChangeComplete={(open) => {
		if (!open) history.back();
	}}
>
	<Dialog.Content>
		<form use:enhance action="?/verifyEmailOTP" method="POST">
			<Dialog.Header>
				<Dialog.Title>Email Confirmation</Dialog.Title>
				<Dialog.Description>
					Enter the OTP sent to your new email to confirm the change. If you did not receive an
					email, check your spam folder or try again.
				</Dialog.Description>
			</Dialog.Header>
			<div class="flex items-center gap-2 pt-4">
				<div class="grid flex-1 gap-2">
					<Form.Field {form} name="otp">
						<Form.Control>
							{#snippet children({ props })}
								<Form.Label>OTP</Form.Label>
								<Input {...props} bind:value={$formData.otp} />
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
