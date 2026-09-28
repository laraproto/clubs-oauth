<script lang="ts">
	import {
		Html,
		Head,
		Body,
		Preview,
		Container,
		Section,
		Row,
		Column,
		Heading,
		Text,
		Img
	} from '@better-svelte-email/components';

	let { code = '000000', origin = 'http://localhost:5173' }: { code: string; origin: string } =
		$props();
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
							<Heading as="h1" class="font-28 text-fg m-0 font-sans">Your OTP Code</Heading>
						</Section>

						<Text class="font-16 text-fg-2 mx-auto mt-0 mb-8 max-w-95 text-center font-sans">
							Use the following OTP code to sign in
						</Text>
						<Section class="bg-fg mx-auto mt-4 mb-3.5 w-70 rounded align-middle">
							<Text
								class="text-fg-inverted mx-auto my-0 block py-2 text-center text-[32px] leading-10 font-bold tracking-[6px]"
							>
								{code}
							</Text>
						</Section>
						<Text class="font-13 text-fg-3 mx-auto mt-8 mb-0 max-w-100 text-center font-sans">
							If you didn't try logging in, you can safely ignore this email.
						</Text>
					</Section>
				</Section>
			</Section>
		</Container>
	</Body>
</Html>
