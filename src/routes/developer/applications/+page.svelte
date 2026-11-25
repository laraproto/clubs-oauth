<script lang="ts">
	import Head from '#lib/components/head.svelte';
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import LinkIcon from '@lucide/svelte/icons/link';
	import { resolve } from '$app/paths';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<Head title="Applications" />

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
	{#each data.applications as app (app.client_id)}
		<Card.Root class="relative mx-auto w-full max-w-sm pt-0">
			<div class="absolute inset-0 z-15 aspect-video bg-black/35"></div>
			<img
				src={app.logo_uri || 'https://placehold.co/600x400?text=No+Image'}
				alt={app.client_name}
				class="relative z-20 aspect-video w-full object-cover"
			/>
			<Card.Header>
				<Card.Title class="flex flex-row items-center">
					{app.client_name}
					{#if app.client_uri}
						<a href={app.client_uri} rel="external noopener noreferrer" target="_blank">
							<LinkIcon
								class="ml-2 size-4 text-muted-foreground hover:cursor-pointer hover:text-primary"
							/>
						</a>
					{/if}
				</Card.Title>
			</Card.Header>
			<Card.Footer>
				<span class="ml-auto text-sm font-medium text-muted-foreground">
					<Button
						variant="outline"
						href={resolve('/developer/applications/[app]', { app: app.client_id })}
						size="sm"
					>
						Edit
					</Button>
				</span>
			</Card.Footer>
		</Card.Root>
	{/each}
</div>
