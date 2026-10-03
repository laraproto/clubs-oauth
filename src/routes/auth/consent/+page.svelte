<script lang="ts">
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import { Button } from '#lib/components/ui/button/index.js';
	import { authConsent as authConsentCommand } from '#lib/auth.remote';

	let { data } = $props();

	const authConsent = async (params: { consent: boolean }) => {
		try {
			const result = await authConsentCommand(params);
			if (result && result.redirect) {
				window.location.href = result.url;
			}
		} catch (err) {
			console.error(err);
		}
	};
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
				<div class="flex flex-col items-center gap-1 text-center">
					<h1 class="text-2xl font-bold">Continue to {data.oauthClient?.client_name}?</h1>
					<p class="text-sm text-balance text-muted-foreground">
						Authorize {data.oauthClient?.client_name} to access your account?
					</p>
					<span class="flex flex-row gap-2 pt-6">
						<Button variant="outline" size="sm" onclick={() => authConsent({ consent: false })}
							>Deny</Button
						>
						<Button variant="default" size="sm" onclick={() => authConsent({ consent: true })}
							>Authorize</Button
						>
					</span>
				</div>
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
