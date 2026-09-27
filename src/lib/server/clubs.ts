import { createOpenApiFetchClient } from 'feature-fetch';
import { CLUBS_API_KEY } from '$app/env/private';
import type { paths } from '#lib/types/openapi';

const client = createOpenApiFetchClient<paths>({
	baseUrl: 'https://clubapi.hackclub.com',
	headers: {
		Authorization: CLUBS_API_KEY
	}
});
export default client;
