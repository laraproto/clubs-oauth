import type { RequestHandler } from './$types';
import favicon from '#lib/assets/favicon.svg?url';

export const GET: RequestHandler = async ({ fetch }) => {
	const response = await fetch(favicon);
	const svg = await response.text();
	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml'
		}
	});
};
