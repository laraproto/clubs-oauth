<script lang="ts">
	import {
		Html,
		Head,
		Body,
		Preview,
		Button,
		Container,
		Section,
		Row,
		Column,
		Heading,
		Text,
		Img
	} from '@better-svelte-email/components';
	import dayjs from '#lib/date.js';

	let {
		origin = 'http://localhost:5173',
		link = origin,
		organization,
		inviter,
		expiration
	}: {
		link: string;
		origin: string;
		organization: string;
		inviter: string;
		expiration: Date;
	} = $props();

	const expirationRelative = $derived.by(() => dayjs().to(expiration, true));
</script>

<Html>
	<Head></Head>
	<Body class="bg-bg-2 m-0 text-center font-sans">
		<Preview preview="Your OTP Code for Clubs OAuth" />
		<Container class="mobile:mt-0 mx-auto mt-8 w-full max-w-160">
			<Section>
				<Section class="bg-bg mobile:px-2 px-6 py-4">
					<Section class="mb-3 px-6">
						<Row>
							<Column class="w-1/2 py-1.75 align-middle">
								<Row>
									<Column class="w-8 align-middle">
										<Img
											src={`${origin}/favicon.svg`}
											alt="Clubs OAuth Logo"
											width="48"
											height="48"
											class="block"
										/>
									</Column>
								</Row>
							</Column>
							<Column align="right" class="w-1/2 py-1.75 align-middle">
								<Text class="font-13 m-0 text-right font-sans">
									<span class="text-fg-3">Clubs OAuth</span>
								</Text>
							</Column>
						</Row>
					</Section>

					<Section class="bg-bg-2 mobile:px-6 mobile:py-12 rounded-[8px] px-10 py-16 text-center">
						<Section class="mb-3">
							<Heading as="h1" class="font-28 text-fg m-0 font-sans">Organization Invite</Heading>
						</Section>

						<Text class="font-16 text-fg-2 mx-auto mt-0 mb-8 max-w-95 text-center font-sans">
							You've been invited to join the organization <strong>{organization}</strong> by
							<strong>{inviter}</strong>. Click the button below to accept the invitation and join
							the organization.
						</Text>
						<Section class="mb-6 text-center">
							<Button
								href={link}
								class="bg-fg font-16 text-fg-inverted inline-block rounded-lg px-7 py-4 text-center font-sans leading-6"
							>
								Accept Invite
							</Button>
						</Section>
						<Text class="font-13 text-fg-3 mx-auto mt-8 mb-0 max-w-100 text-center font-sans">
							The invite link will expire in <strong>{expirationRelative}</strong>. If you did not
							expect this email, you can safely ignore it.
						</Text>
					</Section>
				</Section>
			</Section>
		</Container>
	</Body>
</Html>
