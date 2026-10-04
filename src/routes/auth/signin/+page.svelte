<script lang="ts">
	import LoginForm from './login-form.svelte';
	import { page } from '$app/state';
	import OtpForm from './otp-form.svelte';

	let email = $state('');

	let { data } = $props();
</script>

{#if !page.state.modal}
	<LoginForm form={data.form} bind:email />
{:else}
	<OtpForm form={data.otpForm} {email} />
{/if}
