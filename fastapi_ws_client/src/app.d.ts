// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { WebSocketMiddleman } from './websockets';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			token: string;
			session: string;
			wsconnection: WebSocketMiddleman | undefined;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
