<script lang="ts">
	import { Button, buttonVariants } from '#lib/components/ui/button/index.js';
	import * as Dialog from '#lib/components/ui/dialog/index.js';
	import type { Snippet } from 'svelte';
	import type { VariantProps } from 'tailwind-variants';

	let {
		open = $bindable(false),
		title,
		description,
		variant = 'default',
		children,
		onConfirm,
		onCancel,
		...restProps
	}: {
		open: boolean;
		title: string;
		description: string;
		variant?: VariantProps<typeof buttonVariants>['variant'];
		children?: Snippet;
		onConfirm: () => void;
		onCancel?: () => void;
	} = $props();

	const onSubmit = (event: SubmitEvent) => {
		event.preventDefault();
		onConfirm();
	};
</script>

<Dialog.Root bind:open {...restProps}>
	<Dialog.Content class="sm:max-w-106.25">
		<form onsubmit={onSubmit}>
			<Dialog.Header class="mb-4">
				<Dialog.Title>{title}</Dialog.Title>
				<Dialog.Description>
					{description}
				</Dialog.Description>
			</Dialog.Header>
			{@render children?.()}
			<Dialog.Footer>
				<Dialog.Close
					type="button"
					onclick={onCancel}
					class={buttonVariants({ variant: 'outline' })}
				>
					Cancel
				</Dialog.Close>
				<Button type="submit" {variant}>Confirm</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
