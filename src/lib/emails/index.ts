import { Renderer } from '@better-svelte-email/server';
import { barebonesBoxedTailwindConfig } from './theme';

const { render } = new Renderer({
	tailwindConfig: barebonesBoxedTailwindConfig
});

export default render;
