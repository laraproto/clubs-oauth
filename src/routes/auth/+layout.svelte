<script lang="ts">
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<div class="grid min-h-svh lg:grid-cols-2">
	<div class="flex flex-col gap-4 p-6 md:p-10">
		<div class="flex justify-center gap-2 md:justify-start">
			<span class="flex items-center gap-2 font-medium">
				<div
					class={[
						'flex size-10 items-center justify-center rounded-md text-primary-foreground',
						!data.oauthClient?.logo_uri && 'bg-primary'
					]}
				>
					{#if data.oauthClient?.logo_uri}
						<img src={data.oauthClient.logo_uri} alt="logo" class="size-10 rounded-md" />
					{:else}
						<GalleryVerticalEndIcon class="size-8" />
					{/if}
				</div>
				{data.oauthClient?.client_name ?? 'Clubs OAuth'}
			</span>
		</div>
		<div class="flex flex-1 items-center justify-center">
			<div class="w-full max-w-xs">
				{@render children()}
			</div>
		</div>
		<span class="ml-auto hidden lg:block"
			>Photo taken at <a
				class="text-primary underline transition-all hover:opacity-80"
				href="https://midnight.hackclub.com">Midnight 2026</a
			></span
		>
	</div>
	<div class="relative hidden bg-muted lg:block">
		<img
			src="https://photos.hackclub.com/share/sKl4NEZ_4szo/raw"
			alt="Midnight 2026"
			class="absolute inset-0 h-full w-full object-cover"
		/>
	</div>
</div>
