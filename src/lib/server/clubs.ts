import createClient, { type Middleware } from 'openapi-fetch';
import { CLUBS_API_KEY } from '$app/env/private';
import type { paths } from '#lib/types/openapi';

const authMiddleware: Middleware = {
	async onRequest({ request }) {
		request.headers.set('Authorization', CLUBS_API_KEY);
		return request;
	}
};

const client = createClient<paths>({ baseUrl: 'https://clubapi.hackclub.com' });

client.use(authMiddleware);

export default client;
