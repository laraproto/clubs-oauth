<script lang="ts">
	import Head from '#lib/components/head.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import * as Avatar from '#lib/components/ui/avatar/index.js';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';
	import CreateApp from './create-app.svelte';

	let { data }: PageProps = $props();
</script>

<Head title="Admin Applications" />

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
	{#each data.applications as app (app.clientId)}
		<a href={resolve('/admin/applications/[app]', { app: app.clientId })}>
			<Card.Root class="relative mx-auto w-full max-w-sm pt-0">
				<div class="absolute inset-0 z-15 aspect-video bg-black/35"></div>
				<img src={app.icon} alt={app.name} class="relative z-20 aspect-video w-full object-cover" />
				<Card.Header>
					<Card.Title>{app.name}</Card.Title>
				</Card.Header>
				<Card.Footer>
					<span class="flex flex-row items-center">
						<Avatar.Root class="size-6 rounded-lg">
							<Avatar.Image src={app.user?.image} alt={app.user?.name?.charAt(0).toUpperCase()} />
							<Avatar.Fallback>{app.user?.name?.charAt(0).toUpperCase()}</Avatar.Fallback>
						</Avatar.Root>
						<span class="ml-2 text-sm font-medium">{app.user?.name.split(' ')[0]}</span>
					</span>
				</Card.Footer>
			</Card.Root>
		</a>
	{/each}
</div>

<CreateApp form={data.applicationForm} />
