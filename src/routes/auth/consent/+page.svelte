<script lang="ts">
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

<div class="flex flex-col items-center gap-1 text-center">
	<h1 class="text-2xl font-bold">Continue to {data.oauthClient?.client_name}?</h1>
	<p class="text-sm text-balance text-muted-foreground">
		Authorize {data.oauthClient?.client_name} to access your account?
	</p>
	<span class="flex flex-row gap-2 pt-6">
		<Button variant="outline" size="sm" onclick={() => authConsent({ consent: false })}>Deny</Button
		>
		<Button variant="default" size="sm" onclick={() => authConsent({ consent: true })}
			>Authorize</Button
		>
	</span>
</div>
