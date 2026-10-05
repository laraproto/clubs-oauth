import type { Auth } from '#lib/server/auth';
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: Auth['$Infer']['Session']['user'];
			session?: Auth['$Infer']['Session']['session'];
		}

		// interface Error {}
		interface PageData {
			flash?: { type: 'success' | 'error' | 'info'; message: string };
		}
		interface PageState {
			modal?: boolean;
		}
		// interface Platform {}
	}
}

export {};
